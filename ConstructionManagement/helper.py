import pandas as pd

from managements.models import WorkPackage


def batch_create_workpackages(dataframe):
    """
    DataFrame의 각 Column들의 데이터로 WorkPackage들을 생성한다.
    :param dataframe: WorkPackage를 생성할 Column들로만 구성된 pandas dataframe
    :return: Dataframe에 의해 생성되거나 가져온 모든 부모 WorkPackage 객체들의 list
    """
    result = []
    for i in range(len(dataframe.columns)):
        parent = dataframe.iloc[:, i].name
        children = dataframe.iloc[:, i].unique()
        # Column의 name은 대분류가 되어야 한다.
        p, _ = WorkPackage.objects.get_or_create(package_name=parent, parent_package=None)
        result.append(p)
        # Column들의 데이터들을 돌면서 대분류를 부모로 가지는 소분류들을 생성한다.
        for c in children:
            if pd.isna(c):
                continue
            w, _ = WorkPackage.objects.get_or_create(package_name=str(c), parent_package=p)
    return result
