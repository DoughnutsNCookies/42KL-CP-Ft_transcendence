import { useContext } from "react";
import { FriendActionContext } from "../../../contexts/FriendContext";
import { ACTION_TYPE } from "./FriendActionCard";

function FriendActionConfirmation() {

  const action = useContext(FriendActionContext);
  let style = '';

  if (action === ACTION_TYPE.ACCEPT || action === ACTION_TYPE.UNBLOCK)
    style = 'bg-accGreen';
  else if (action === ACTION_TYPE.BLOCK || action === ACTION_TYPE.UNFRIEND)
    style = 'bg-accRed';

  if (action === ACTION_TYPE.ACCEPT)
    return <p>Would you like to <span className={`${style}`}>accept</span> this friend request?</p>
  else if (action === ACTION_TYPE.BLOCK || action === ACTION_TYPE.UNBLOCK || action === ACTION_TYPE.UNFRIEND || action === ACTION_TYPE.ADD)
    return <p>Are you sure you want to <span className={`${style}`}>{action}</span> this friend?</p>
  return <></>
}

export default FriendActionConfirmation;