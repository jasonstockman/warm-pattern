import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import sortBy from 'lodash/sortBy';
import LoadingSpinner from 'plaid-threads/LoadingSpinner';
import Callout from 'plaid-threads/Callout';
import Button from 'plaid-threads/Button';

import { ItemType, AccountType, AssetType, UserType } from './types';

import useItems from "../services/items";
import useTransactions from "../services/transactions";
import { useUsers } from "../contexts/UsersContext";
import useAssets from "../services/assets";
import useLink from "../services/link";
import useAccounts from "../services/accounts";

import { pluralize } from "../util/index";

import Banner from "./Banner";
import LaunchLink from "./LaunchLink";
import SpendingInsights from "./SpendingInsights";
import NetWorth from "./NetWorth";
import ItemCard from "./ItemCard";
import UserCard from "./UserCard";
import LoadingCallout from "./LoadingCallout";
import ErrorMessage from "./ErrorMessage";

// provides view of user's net worth, spending by category and allows them to explore
// account and transactions details for linked items

const UserPage = () => {
  const router = useRouter();
  const { userId: userIdParam } = router.query;
  const userId = useMemo(() => userIdParam ? Number(userIdParam) : 0, [userIdParam]);
  
  // Add ref to track initial data loading to prevent repeated API calls
  const initialLoad = useRef(false);
  
  // Set body overflow to auto to override overflow:hidden from link pane
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.getElementsByTagName('body')[0].style.overflow = 'auto';
    }
  }, []);
  
  const [user, setUser] = useState<UserType>({
    id: 0,
    username: '',
    created_at: '',
    updated_at: '',
  });
  const [items, setItems] = useState<ItemType[]>([]);
  const [token, setToken] = useState('');
  const [numOfItems, setNumOfItems] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState<AccountType[]>([]);
  const [assets, setAssets] = useState<AssetType[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get services directly without destructuring
  const transactionsService = useTransactions();
  const accountsService = useAccounts();
  const assetsService = useAssets();
  const usersService = useUsers();
  const itemsService = useItems();
  const linkService = useLink();
  
  // Memoize the service values to prevent reference changes
  const transactionsByUser = useMemo(() => 
    transactionsService?.transactionsByUser || {}, 
    [transactionsService]
  );
  
  const accountsByUser = useMemo(() => 
    accountsService?.accountsByUser || {}, 
    [accountsService]
  );
  
  const assetsByUser = useMemo(() => 
    assetsService?.assetsByUser || { assets: [] }, 
    [assetsService]
  );
  
  const usersById = useMemo(() => 
    usersService?.usersById || {}, 
    [usersService]
  );
  
  const itemsByUser = useMemo(() => 
    itemsService?.itemsByUser || {}, 
    [itemsService]
  );
  
  const linkTokens = useMemo(() => 
    linkService?.linkTokens || { 
      byUser: {}, 
      error: { 
        error_code: null, 
        error_type: '', 
        error_message: '' 
      } 
    }, 
    [linkService]
  );
  
  // Memoize service methods
  const getTransactionsByUser = useCallback(
    (userId: UserId) => {
      if (transactionsService?.getTransactionsByUser) {
        return transactionsService.getTransactionsByUser(userId);
      }
    },
    [transactionsService]
  );
  
  const getAccountsByUser = useCallback(
    (userId: UserId) => {
      if (accountsService?.getAccountsByUser) {
        return accountsService.getAccountsByUser(userId);
      }
    },
    [accountsService]
  );
  
  const getAssetsByUser = useCallback(
    (userId: UserId) => {
      if (assetsService?.getAssetsByUser) {
        return assetsService.getAssetsByUser(userId);
      }
    },
    [assetsService]
  );
  
  const getUserById = useCallback(
    (userId: UserId, refresh?: boolean) => {
      if (usersService?.getUserById) {
        return usersService.getUserById(userId, refresh);
      }
    },
    [usersService]
  );
  
  const getItemsByUser = useCallback(
    (userId: UserId, refresh?: boolean) => {
      if (itemsService?.getItemsByUser) {
        return itemsService.getItemsByUser(userId, refresh);
      }
    },
    [itemsService]
  );
  
  const generateLinkToken = useCallback(
    (userId: UserId, param: any) => {
      if (linkService?.generateLinkToken) {
        return linkService.generateLinkToken(userId, param);
      }
    },
    [linkService]
  );

  const initiateLink = useCallback(async () => {
    try {
      // only generate a link token upon a click from enduser to add a bank;
      // if done earlier, it may expire before enduser actually activates Link to add a bank.
      await generateLinkToken(userId, null);
    } catch (err) {
      console.error('Error generating link token:', err);
      setError('Failed to generate link token');
    }
  }, [generateLinkToken, userId]);

  // Fix the token state update to only change when necessary
  useEffect(() => {
    const userToken = linkTokens.byUser[userId] || '';
    if (token !== userToken) {
      setToken(userToken);
    }
  }, [linkTokens, userId, token]);

  // Fix the numOfItems state update to only change when necessary
  useEffect(() => {
    const newNumOfItems = itemsByUser[userId] != null ? itemsByUser[userId].length : 0;
    if (numOfItems !== newNumOfItems) {
      setNumOfItems(newNumOfItems);
    }
  }, [itemsByUser, userId, numOfItems]);

  // Fix the items state update to only change when necessary
  useEffect(() => {
    const newItems = itemsByUser[userId] || [];
    const orderedItems = sortBy(
      newItems,
      item => new Date(item.updated_at)
    ).reverse();
    
    // Only update if the items have changed - compare IDs to avoid deep comparison
    const currentIds = items.map(item => item.id).join(',');
    const newIds = orderedItems.map(item => item.id).join(',');
    
    if (currentIds !== newIds) {
      setItems(orderedItems);
    }
  }, [itemsByUser, userId, items]);

  // Fix the transactions state update to only change when necessary
  useEffect(() => {
    const userTransactions = transactionsByUser[userId] || [];
    
    // Only update if transactions changed - compare length as a simple check
    if (transactions.length !== userTransactions.length) {
      setTransactions(userTransactions);
    }
  }, [transactionsByUser, userId, transactions]);

  // Fix the accounts state update to only change when necessary
  useEffect(() => {
    const userAccounts = accountsByUser[userId] || [];
    
    // Only update if accounts changed - compare length as a simple check
    if (accounts.length !== userAccounts.length) {
      setAccounts(userAccounts);
    }
  }, [accountsByUser, userId, accounts]);

  // Fix the assets state update to only change when necessary
  useEffect(() => {
    const userAssets = assetsByUser.assets || [];
    
    // Only update if assets changed - compare length as a simple check
    if (assets.length !== userAssets.length) {
      setAssets(userAssets);
    }
  }, [assetsByUser, assets]);

  // Fix the user state update to only change when necessary
  useEffect(() => {
    const userData = usersById[userId];
    if (userData && (!user.id || user.id !== userData.id)) {
      setUser(userData);
    }
  }, [usersById, userId, user]);

  // Modify the data fetching effect to avoid repeated calls
  useEffect(() => {
    let mounted = true;
    
    // Only fetch once, not on every render
    if (userId && getUserById && !initialLoad.current) {
      initialLoad.current = true;
      
      try {
        getUserById(userId, false);
        
        // Also fetch related data if not already loaded
        if (getTransactionsByUser) getTransactionsByUser(userId);
        if (getItemsByUser) getItemsByUser(userId, true);
        if (getAccountsByUser) getAccountsByUser(userId);
        if (getAssetsByUser) getAssetsByUser(userId);
      } catch (err) {
        console.error('Error loading user data:', err);
        if (mounted) {
          setError('Failed to load user data');
        }
      }
    }
    
    return () => {
      mounted = false;
    };
  }, [
    userId, 
    getUserById, 
    getTransactionsByUser, 
    getItemsByUser, 
    getAccountsByUser, 
    getAssetsByUser
  ]);

  return (
    <div>
      {error && (
        <div className="error-message" style={{ color: 'red', padding: '10px', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      <Link href="/" legacyBehavior>
        <a className="navigation-link-wrapper">
          BACK TO LOGIN
        </a>
      </Link>

      <Banner />
      {linkTokens.error.error_code != null && (
        <Callout warning>
          <div>
            Unable to fetch link_token: please make sure your backend server is
            running and that your .env file has been configured correctly.
          </div>
          <div>
            Error Code: <code>{linkTokens.error.error_code}</code>
          </div>
          <div>
            Error Type: <code>{linkTokens.error.error_type}</code>{' '}
          </div>
          <div>Error Message: {linkTokens.error.error_message}</div>
        </Callout>
      )}
      <UserCard user={user} userId={userId} removeButton={false} linkButton />
      {numOfItems === 0 && <ErrorMessage />}
      {numOfItems > 0 && transactions.length === 0 && (
        <div className="loading">
          <LoadingSpinner />
          <LoadingCallout />
        </div>
      )}
      {numOfItems > 0 && transactions.length > 0 && (
        <>
          <NetWorth
            accounts={accounts}
            numOfItems={numOfItems}
            personalAssets={assets}
            userId={userId}
            assetsOnly={false}
          />
          <SpendingInsights
            numOfItems={numOfItems}
            transactions={transactions}
          />
        </>
      )}
      {numOfItems === 0 && transactions.length === 0 && assets.length > 0 && (
        <>
          <NetWorth
            accounts={accounts}
            numOfItems={numOfItems}
            personalAssets={assets}
            userId={userId}
            assetsOnly
          />
        </>
      )}
      {numOfItems > 0 && (
        <>
          <div className="item__header">
            <div>
              <h2 className="item__header-heading">
                {`${items.length} ${pluralize('Bank', items.length)} Linked`}
              </h2>
              {!!items.length && (
                <p className="item__header-subheading">
                  Below is a list of all your connected banks. Click on a bank
                  to view its associated accounts.
                </p>
              )}
            </div>

            <Button
              large
              inline
              className="add-account__button"
              onClick={initiateLink}
            >
              Add another bank
            </Button>

            {token != null && token.length > 0 && (
              // Link will not render unless there is a link token
              <LaunchLink token={token} userId={userId} itemId={null} />
            )}
          </div>
          <ErrorMessage />
          {items.map(item => (
            <div id="itemCards" key={item.id}>
              <ItemCard item={item} userId={userId} />
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default UserPage;
