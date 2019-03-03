import os


def isLocal():
    # https://stackoverflow.com/questions/1916579/in-python-how-can-i-test-if-im-in-google-app-engine-sdk#comment1822313_1916594
    if os.environ['SERVER_SOFTWARE'].find('Development') == 0:
        return True
    else:
        return False


def log(var):
    if isLocal():
        print var
