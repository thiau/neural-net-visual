from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import re


class TextProcessor:
    def __init__(self, sentences):
        self.sentences = sentences
        self.stop_words = stopwords.words("english")
        self.lemmatizer = WordNetLemmatizer()
        self.sentence_tokens = list()
        self.corpus = list()

    def remove_stopwords(self, tokens):
        return [word for word in tokens if word not in self.stop_words]

    def convert_to_lowercase(self, sentence):
        return sentence.lower()

    def remove_numbers(self, sentence):
        return re.sub(r"\d+", "", sentence)

    def remove_punctuation(self, sentence):
        return re.sub(r"[^\w\s]", "", sentence)

    def remove_whitespaces(self, sentence):
        return sentence.strip()

    def tokenize(self, sentence):
        return word_tokenize(sentence)

    def lemmatize_word(self, tokens):
        return [self.lemmatizer.lemmatize(token) for token in tokens]

    def process_text(self):
        for sentence in self.sentences:
            # sentence pre processing
            sentence = self.convert_to_lowercase(sentence)
            sentence = self.remove_punctuation(sentence)
            sentence = self.remove_whitespaces(sentence)
            sentence = self.remove_numbers(sentence)

            # token pre processing
            tokens = self.tokenize(sentence)
            tokens = self.remove_stopwords(tokens)
            tokens = self.remove_stopwords(tokens)
            tokens = self.lemmatize_word(tokens)

            # corpus creation
            self.sentence_tokens.append(tokens)
            self.corpus.append(" ".join(tokens))

    def get_sentence_tokens(self):
        return self.sentence_tokens

    def get_corpus(self):
        return self.corpus
