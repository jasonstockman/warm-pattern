import React, { useState, useEffect } from 'react';
import { Callout } from 'plaid-threads/Callout';
import { IconButton } from 'plaid-threads/IconButton';
import { CloseS2 } from 'plaid-threads/Icons/CloseS2';

import useErrors from "../services/errors";
import { isDefined, safeGet } from '../utils/errorHandling';

/**
 * ErrorMessage component
 * 
 * Displays Plaid-related error messages in a callout component
 * with proper error handling.
 */
export default function ErrorMessage() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const { error, resetError } = useErrors();

  useEffect(() => {
    const errors = [
      'INSTITUTION_NOT_RESPONDING',
      'INSTITUTION_DOWN',
      'INSTITUTION_NOT_AVAILABLE',
      'INTERNAL_SERVER_ERROR',
      'USER_SETUP_REQUIRED',
      'ITEM_LOCKED',
      'INVALID_CREDENTIALS',
      'INVALID_UPDATED_USERNAME',
      'INSUFFICIENT_CREDENTIALS',
      'MFA_NOT_SUPPORTED',
      'NO_ACCOUNTS',
    ];

    // Use safer code with isDefined and safeGet
    const errorCode = safeGet(error, 'code');
    if (isDefined(errorCode) && errors.includes(errorCode)) {
      setShow(true);
      setMessage(safeGet(error, 'message', '') || '');
    }
  }, [error]);

  // Early return if error is not defined or doesn't have a code
  if (!isDefined(error) || !isDefined(safeGet(error, 'code'))) {
    return null;
  }

  return (
    <>
      {show && (
        <Callout className="errMsgCallout">
          <IconButton
            className="closeBtn"
            accessibilityLabel="close"
            onClick={() => {
              setShow(false);
              resetError();
            }}
            icon={<CloseS2 />}
          />
          Error: {safeGet(error, 'code')} <br />
          {message}
        </Callout>
      )}
    </>
  );
}
