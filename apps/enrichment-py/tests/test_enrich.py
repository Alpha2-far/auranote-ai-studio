import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from auranote_enrich import (  # noqa: E402
    clean_ui_noise,
    extract_title,
    segment_sections,
    sections_to_markdown,
    extract_keywords,
    extractive_summary,
    classify_aura,
    enrich,
)


class TestClean(unittest.TestCase):
    def test_removes_ui_noise(self):
        self.assertEqual(clean_ui_noise("ChatGPT a dit :\nBonjour\nCopier la réponse"), "Bonjour")

    def test_collapses_blank_lines(self):
        self.assertEqual(clean_ui_noise("a\n\n\n\nb"), "a\n\nb")

    def test_empty(self):
        self.assertEqual(clean_ui_noise(""), "")


class TestSegment(unittest.TestCase):
    def test_numbered_sections(self):
        secs = segment_sections("1. Première\nTexte\n2. Deuxième")
        self.assertEqual(len(secs), 2)
        self.assertEqual(secs[0]["number"], 1)
        self.assertEqual(secs[0]["title"], "Première")

    def test_callouts(self):
        secs = segment_sections("1. T\nL'intuition clé : ceci\nLa clarification : cela")
        styles = [b["style"] for b in secs[0]["blocks"] if b["type"] == "callout"]
        self.assertEqual(styles, ["intuition", "clarification"])

    def test_multiline_callout(self):
        secs = segment_sections("1. T\nL'intuition clé : ligne1\nligne2")
        callout = next(b for b in secs[0]["blocks"] if b["type"] == "callout")
        self.assertEqual(callout["content"], "ligne1\nligne2")

    def test_bullets(self):
        secs = segment_sections("- un\n- deux\n* trois")
        bullets = [b for b in secs[0]["blocks"] if b["type"] == "bullet"]
        self.assertEqual(len(bullets), 3)

    def test_markdown_roundtrip(self):
        md = sections_to_markdown(segment_sections("1. Titre\n- point"))
        self.assertIn("## 1. Titre", md)
        self.assertIn("- point", md)


class TestTitle(unittest.TestCase):
    def test_heading(self):
        self.assertEqual(extract_title("# Mon titre\ncontenu"), "Mon titre")

    def test_first_sentence(self):
        self.assertEqual(extract_title("Ceci est la première phrase. Une autre."), "Ceci est la première phrase.")

    def test_empty(self):
        self.assertEqual(extract_title("   "), "Sans titre")


class TestAnalyze(unittest.TestCase):
    def test_keywords_exclude_stopwords(self):
        kws = extract_keywords("Le déploiement du déploiement de l'architecture serveur serveur serveur")
        self.assertIn("serveur", kws)
        self.assertIn("déploiement", kws)
        self.assertNotIn("le", kws)
        self.assertNotIn("de", kws)

    def test_keywords_frequency_order(self):
        kws = extract_keywords("alpha alpha alpha beta beta gamma", top_n=3)
        self.assertEqual(kws[0], "alpha")

    def test_summary_limits_sentences(self):
        text = "Phrase une importante. Phrase deux. Phrase trois. Phrase quatre importante importante."
        summary = extractive_summary(text, max_sentences=2)
        self.assertTrue(summary)
        self.assertLessEqual(summary.count("."), 3)

    def test_summary_short_text(self):
        self.assertEqual(extractive_summary("Une seule phrase."), "Une seule phrase.")

    def test_classify_tech(self):
        self.assertEqual(classify_aura("Il faut refactor l'API et le backend du serveur.")["aura"], "Technique & Architecture")

    def test_classify_strategy(self):
        self.assertEqual(classify_aura("Notre décision et notre vision stratégique.")["aura"], "Stratégie & Décisions")

    def test_classify_default(self):
        self.assertEqual(classify_aura("Une pensée poétique au hasard.")["aura"], "Inspirations & Idées brutes")


class TestPipeline(unittest.TestCase):
    def test_enrich_full(self):
        r = enrich("# Sujet technique\n1. Point\nRefactor de l'API serveur backend.")
        self.assertEqual(r["title"], "Sujet technique")
        self.assertTrue(r["sections"])
        self.assertTrue(r["keywords"])
        self.assertEqual(r["suggestedAura"], "Technique & Architecture")
        self.assertIn(r["suggestedAura"], r["suggestedTags"])

    def test_enrich_explicit_title(self):
        r = enrich("contenu", title="Titre imposé")
        self.assertEqual(r["title"], "Titre imposé")


if __name__ == "__main__":
    unittest.main()
