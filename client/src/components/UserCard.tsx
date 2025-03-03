import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Button } from './ui';

import UserDetails from "./UserDetails";
import LaunchLink from "./LaunchLink";

import useItems from "../services/items";
import { useUserActions } from "../store";
import useLink from "../services/link";

import { User, UserId, createId } from '../types';

interface Props {
  user: User;
  removeButton: boolean;
  linkButton: boolean;
  userId: UserId;
}

/**
 * UserCard component
 * 
 * Displays information about a user with options to manage them.
 */
export default function UserCard(props: Props) {
  const [numOfItems, setNumOfItems] = useState(0);
  const [token, setToken] = useState('');
  const [hovered, setHovered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get services directly without destructuring
  const itemsService = useItems();
  const { removeUser } = useUserActions();
  const linkService = useLink();

  // Get items by user from the items service
  const itemsByUser = itemsService?.itemsByUser || {};
  
  // Memoize service functions to prevent recreating on each render
  const getItemsByUser = useCallback(
    (userId: UserId, refresh: boolean) => {
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
  
  const linkTokensByUser = linkService?.linkTokens?.byUser || {};

  const initialFetchRef = useRef(false);

  const initiateLink = useCallback(async () => {
    try {
      // only generate a link token upon a click from enduser to add a bank;
      // if done earlier, it may expire before enduser actually activates Link to add a bank.
      await generateLinkToken(props.userId, null);
    } catch (err) {
      console.error('Error generating link token:', err);
      setError('Failed to generate link token');
    }
  }, [props.userId, generateLinkToken]);

  // update data store with the user's items - only when component mounts or userId changes
  useEffect(() => {
    let mounted = true;
    
    // Only fetch once when component mounts or userId changes
    if (props.userId && getItemsByUser && !initialFetchRef.current) {
      initialFetchRef.current = true;
      try {
        getItemsByUser(props.userId, true);
      } catch (err) {
        console.error('Error getting items by user:', err);
        if (mounted) {
          setError('Failed to fetch user items');
        }
      }
    }
    
    return () => {
      mounted = false;
    };
  }, [props.userId, getItemsByUser]);

  // update no of items from data store
  useEffect(() => {
    const newNumOfItems = itemsByUser && itemsByUser[props.userId] != null 
      ? itemsByUser[props.userId].length 
      : 0;
    
    if (numOfItems !== newNumOfItems) {
      setNumOfItems(newNumOfItems);
    }
  }, [itemsByUser, props.userId]);

  // Set token only when linkTokensByUser changes
  useEffect(() => {
    const userToken = linkTokensByUser[props.userId] || '';
    if (token !== userToken) {
      setToken(userToken);
    }
  }, [linkTokensByUser, props.userId]);

  const handleDeleteUser = useCallback(() => {
    if (removeUser) {
      removeUser(createId.user(props.user.id)); // Convert to branded UserId type
    }
  }, [removeUser, props.user.id]);
  
  return (
    <div className="box user-card__box">
      {error && <div className="error-message">{error}</div>}
      <div className="card user-card">
        <div
          className="hoverable"
          onMouseEnter={() => {
            if (numOfItems > 0) {
              setHovered(true);
            }
          }}
          onMouseLeave={() => {
            setHovered(false);
          }}
        >
          <Link href={`/user/${props.userId}#itemCards`} legacyBehavior>
            <a className="user-card-clickable">
              <div className="user-card__detail">
                <UserDetails
                  hovered={hovered}
                  user={props.user}
                  numOfItems={numOfItems}
                />
              </div>
            </a>
          </Link>
        </div>
        {(props.removeButton || (props.linkButton && numOfItems === 0)) && (
          <div className="user-card__buttons">
            {props.linkButton && numOfItems === 0 && (
              <Button
                size="lg"
                className="add-account__button"
                onClick={initiateLink}
              >
                Add a bank
              </Button>
            )}
            {token != null &&
              token.length > 0 &&
              props.linkButton &&
              numOfItems === 0 && (
                <LaunchLink userId={props.userId} token={token} itemId={null} />
              )}
            {props.removeButton && (
              <Button
                className="remove"
                onClick={handleDeleteUser}
                size="sm"
                variant="danger"
              >
                Delete user
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
