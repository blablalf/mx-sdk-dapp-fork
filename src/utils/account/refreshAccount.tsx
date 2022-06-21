import { getAccountProvider } from 'providers/accountProvider';
import { setAccount } from 'reduxStore/slices';
import { store } from 'reduxStore/store';
import getAccount from './getAccount';
import getAddress from './getAddress';
import getLatestNonce from './getLatestNonce';

const setNewAccount = async () => {
  try {
    const address = await getAddress();
    try {
      const account = await getAccount(address);
      if (account != null) {
        const accountData = {
          balance: account.balance.toFixed(),
          address,
          nonce: getLatestNonce(account),
          username: account.userName
        };
        store.dispatch(setAccount(accountData));
        return accountData;
      }
    } catch (e) {
      console.error('Failed getting account ', e);
    }
  } catch (e) {
    console.error('Failed getting address ', e);
  }
  return null;
};

export async function refreshAccount() {
  const provider = getAccountProvider();
  if (provider == null) {
    throw 'Provider not initialized';
  }
  if (!provider.isInitialized || provider.isInitialized()) {
    return setNewAccount();
  } else {
    try {
      if (!provider.init) {
        throw 'Current provider does not have init() function';
      }

      const initialized = await provider.init();
      if (!initialized) {
        return;
      }
      return setNewAccount();
    } catch (e) {
      console.error('Failed initializing provider ', e);
    }
  }
  return undefined;
}
