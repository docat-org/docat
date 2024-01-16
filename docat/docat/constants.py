import os
from typing import Optional

ENV_GLOBAL_CLAIM_TOKEN = "DOCAT_GLOBAL_CLAIM_TOKEN"
ENV_GLOBAL_CLAIM_SALT = "DOCAT_GLOBAL_CLAIM_SALT"


def get_global_claim_token() -> Optional[str]:
    """Returns the global claim token which can be defined by an environment variable.

    Returns:
        The optional global claim token or None.
    """
    return os.environ.get(ENV_GLOBAL_CLAIM_TOKEN, None)


def get_global_claim_salt() -> Optional[bytes]:
    """Returns the global claim salt which can be defined by an environment variable.

    Returns:
        The optional global claim salt or None.
    """
    global_claim_salt = os.environ.get(ENV_GLOBAL_CLAIM_SALT, None)
    if global_claim_salt is not None:
        return global_claim_salt.encode()
    return None
