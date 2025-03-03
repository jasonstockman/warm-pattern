import React, { useEffect, useState } from 'react';
import Note from 'plaid-threads/Note';
import Touchable from 'plaid-threads/Touchable';
import { InlineLink } from 'plaid-threads/InlineLink';
import { Callout } from 'plaid-threads/Callout';
import { Institution } from 'plaid/dist/api';

import { ItemType, AccountType } from './types';
import AccountCard from "./AccountCard";
import MoreDetails from "./MoreDetails";
import ItemDetailView from "./items/ItemDetailView";

import {
  useAccounts,
  useInstitutions,
  useItems,
  useTransactions,
} from '../services';
import { setItemToBadState } from "../services/api";
import { diffBetweenCurrentTime } from "../util/index";

const PLAID_ENV = process.env.REACT_APP_PLAID_ENV || 'sandbox';

interface Props {
  item: ItemType;
  userId: number;
}

const ItemCard = (props: Props) => {
  const [accounts, setAccounts] = useState<AccountType[]>([]);
  const [institution, setInstitution] = useState<Institution>({
    logo: '',
    name: '',
    institution_id: '',
    oauth: false,
    products: [],
    country_codes: [],
    routing_numbers: [],
  });
  const [showAccounts, setShowAccounts] = useState(false);
  const [viewMode, setViewMode] = useState<'accounts' | 'details'>('accounts');

  const { accountsByItem } = useAccounts();
  const { deleteAccountsByItemId } = useAccounts();
  const { deleteItemById } = useItems();
  const { deleteTransactionsByItemId } = useTransactions();
  const {
    institutionsById,
    getInstitutionById,
    formatLogoSrc,
  } = useInstitutions();
  const { id, plaid_institution_id, status } = props.item;
  const isSandbox = PLAID_ENV === 'sandbox';
  const isGoodState = status === 'good';

  useEffect(() => {
    const itemAccounts: AccountType[] = accountsByItem[id];
    setAccounts(itemAccounts || []);
  }, [accountsByItem, id]);

  useEffect(() => {
    setInstitution(institutionsById[plaid_institution_id] || {});
  }, [institutionsById, plaid_institution_id]);

  useEffect(() => {
    getInstitutionById(plaid_institution_id);
  }, [getInstitutionById, plaid_institution_id]);

  const handleSetBadState = () => {
    setItemToBadState(id);
  };
  const handleDeleteItem = () => {
    deleteItemById(id, props.userId);
    deleteAccountsByItemId(id);
    deleteTransactionsByItemId(id);
  };

  const cardClassNames = showAccounts
    ? 'card item-card expanded'
    : 'card item-card';
  
  const toggleView = () => {
    setViewMode(viewMode === 'accounts' ? 'details' : 'accounts');
  };
  
  return (
    <div className="box">
      <div className={cardClassNames}>
        <Touchable
          className="item-card__clickable"
          onClick={() => setShowAccounts(current => !current)}
        >
          <div className="item-card__column-1">
            <img
              className="item-card__img"
              src={formatLogoSrc(institution.logo)}
              alt={institution && institution.name}
            />
            <p>{institution && institution.name}</p>
          </div>
          <div className="item-card__column-2">
            {isGoodState ? (
              <Note info solid>
                Updated
              </Note>
            ) : (
              <Note error solid>
                Update Mode
              </Note>
            )}
          </div>
        </Touchable>
        
        {showAccounts && (
          <div className="item-detail-wrapper">
            <div className="item-detail-header mb-4 flex justify-between">
              <div className="view-toggle">
                <button
                  className={`mr-4 pb-2 ${viewMode === 'accounts' ? 'border-b-2 border-blue-500 font-semibold text-blue-600' : 'text-gray-500'}`}
                  onClick={() => setViewMode('accounts')}
                >
                  Legacy View
                </button>
                <button
                  className={`pb-2 ${viewMode === 'details' ? 'border-b-2 border-blue-500 font-semibold text-blue-600' : 'text-gray-500'}`}
                  onClick={() => setViewMode('details')}
                >
                  Detailed View
                </button>
              </div>
              
              {isSandbox && (
                <div className="sandbox-actions">
                  {isGoodState ? (
                    <button
                      onClick={handleSetBadState}
                      className="mr-3 rounded bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600"
                    >
                      Test Error State
                    </button>
                  ) : (
                    <MoreDetails
                      setBadStateShown={false}
                      handleSetBadState={handleSetBadState}
                      userId={props.userId}
                      itemId={id}
                      handleDelete={handleDeleteItem}
                    />
                  )}
                  <button
                    onClick={handleDeleteItem}
                    className="rounded bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                  >
                    Delete Item
                  </button>
                </div>
              )}
            </div>
            
            {viewMode === 'accounts' ? (
              /* Original accounts view */
              <>
                {accounts.map(account => (
                  <AccountCard key={account.id} account={account} />
                ))}
                {accounts.length <= 0 && (
                  <Callout warning>
                    No accounts have been created for this item. This may mean that the login
                    credentials provided were incorrect or that the intitution is experiencing
                    downtime right now.
                  </Callout>
                )}
                {accounts.length > 0 && 
                  <p className="item-card__last-update">
                    Last updated: {diffBetweenCurrentTime(accounts[0].updated_at)}
                  </p>
                }
                {!isGoodState && isSandbox && (
                  <InlineLink onClick={handleSetBadState}>
                    You're in update mode!
                    <br />
                    Click to reset
                  </InlineLink>
                )}
              </>
            ) : (
              /* New detailed view */
              <ItemDetailView 
                itemId={Number(id)} 
                institutionName={institution && institution.name} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemCard;
