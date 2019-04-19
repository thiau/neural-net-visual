""" Dataset Management Module """

import pandas as pd


def load_pandas_dataset(file_name: str):
    """ Load main dataset """
    dataset = pd.read_json(
        "resources/datasets/{0}.json".format(file_name), lines=True)
    dataset = dataset.iloc[:, 1:]
    return dataset
