from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.feature_extraction.text import CountVectorizer


class Encoder():
    def __init__(self, encoder_type, **kwargs):
        encoders = {"tfidf": TfidfTransformer, "count": CountVectorizer}
        encoder_object = encoders.get(encoder_type)
        self.encoder = encoder_object(**kwargs)

    def encode(self, variables):
        return self.encoder.fit_transform(variables)

    def transform(self, variables):
        return self.encoder.transform(variables)
