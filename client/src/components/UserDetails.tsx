import React from 'react';
import { pluralize, formatDate } from "../util/index";
import { User } from '../types';

interface Props {
  user: User;
  numOfItems: number;
  hovered: boolean;
}

/**
 * UserDetails component
 * 
 * Displays detailed information about a user.
 */
const UserDetails = (props: Props) => (
  <>
    <div className="user-card__column-1">
      <h3 className="heading">User name</h3>
      <p className="value">{props.user.username}</p>
    </div>
    <div className="user-card__column-2">
      <h3 className="heading">Created on</h3>
      <p className="value">{formatDate(props.user.created_at)}</p>
    </div>
    <div className="user-card__column-3">
      <h3 className="heading">Number of banks connected</h3>
      <p className="value">
        {props.hovered ? 'View ' : ''}{' '}
        {`${props.numOfItems} ${pluralize('bank', props.numOfItems)}`}
      </p>
    </div>
  </>
);

export default UserDetails;
