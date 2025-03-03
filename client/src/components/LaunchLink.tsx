import React, { useEffect } from 'react';
import {
  usePlaidLink,
  PlaidLinkOnSuccessMetadata,
  PlaidLinkOnExitMetadata,
  PlaidLinkError,
  PlaidLinkOptionsWithLinkToken,
  PlaidLinkOnEventMetadata,
  PlaidLinkStableEvent,
} from 'react-plaid-link';
import { useHistory } from 'react-router-dom';

import { logEvent, logSuccess, logExit } from "../util/index"; // functions to log and save errors and metadata from Link events

import { useItemActions, useLinkActions } from "../store";
import { exchangeToken, setItemState } from "../services/api"
import { UserId, ItemId } from '../types';

interface Props {
  isOauth?: boolean;
  token: string;
  userId: UserId;
  itemId?: ItemId | null;
  children?: React.ReactNode;
}

// Uses the usePlaidLink hook to manage the Plaid Link creation.  See https://github.com/plaid/react-plaid-link for full usage instructions.
// The link token passed to usePlaidLink cannot be null.  It must be generated outside of this component.  In this sample app, the link token
// is generated in the link context in client/src/services/link.js.

export default function LaunchLink(props: Props) {
  const history = useHistory();
  const { getItemById, getItemsByUser } = useItemActions();
  const { generateLinkToken, deleteLinkToken, resetError } = useLinkActions();

  // define onSuccess, onExit and onEvent functions as configs for Plaid Link creation
  const onSuccess = async (
    publicToken: string,
    metadata: PlaidLinkOnSuccessMetadata
  ) => {
    // log and save metatdata
    logSuccess(metadata, props.userId);
    if (props.itemId != null) {
      // update mode: no need to exchange public token
      await setItemState(props.itemId, 'good');
      deleteLinkToken(null, props.itemId);
      getItemById(props.itemId, true);
    } else {
      // regular link mode: exchange public token for access token
      await exchangeToken(
        publicToken,
        metadata.institution,
        metadata.accounts,
        props.userId
      );
      getItemsByUser(props.userId, true);
    }
    resetError();
    deleteLinkToken(props.userId, null);
    history.push(`/user/${props.userId}`);
  };

  const onExit = async (
    error: PlaidLinkError | null,
    metadata: PlaidLinkOnExitMetadata
  ) => {
    // log and save error and metatdata
    logExit(error, metadata, props.userId);
    if (error != null && error.error_code === 'INVALID_LINK_TOKEN') {
      const itemId = props.itemId ?? null;
      await generateLinkToken(props.userId, itemId);
    }
    if (error != null) {
      // to handle other error codes, see https://plaid.com/docs/errors/
    }
  };

  const onEvent = async (
    eventName: PlaidLinkStableEvent | string,
    metadata: PlaidLinkOnEventMetadata
  ) => {
    // handle errors in the event end-user does not exit with onExit function error enabled.
    logEvent(eventName, metadata);
  };

  const config: PlaidLinkOptionsWithLinkToken = {
    onSuccess,
    onExit,
    onEvent,
    token: props.token,
  };

  if (props.isOauth) {
    config.receivedRedirectUri = window.location.href; // add additional receivedRedirectUri config when handling an OAuth reidrect
  }

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    // initiallizes Link automatically
    if (props.isOauth && ready) {
      open();
    } else if (ready) {
      // regular, non-OAuth case:
      // set link token, userId and itemId in local storage for use if needed later by OAuth

      localStorage.setItem(
        'oauthConfig',
        JSON.stringify({
          userId: props.userId,
          itemId: props.itemId,
          token: props.token,
        })
      );
      open();
    }
  }, [ready, open, props.isOauth, props.userId, props.itemId, props.token]);

  return <></>;
}
