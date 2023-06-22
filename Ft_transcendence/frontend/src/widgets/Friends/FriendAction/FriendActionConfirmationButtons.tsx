import { useContext } from "react";
import { ActionFunctionsContext, FriendActionContext } from "../../../contexts/FriendContext";
import { ACTION_TYPE } from "./FriendActionCard";

interface FriendActionConfirmationButtonsProps {
  friendIntraName: string;
  friendUserName: string;
  ignoreAction: () => void;
  useAlternativeAction: boolean;
}

function FriendActionConfirmationButtons(props: FriendActionConfirmationButtonsProps) {

  const action = useContext(FriendActionContext);
  const { yesAction, noAction, alternativeAction } = useContext(ActionFunctionsContext);

  const { friendIntraName, ignoreAction, useAlternativeAction } = props;

  return (
    <>
      <button className={`hover:bg-highlight hover:text-dimshadow font-thin focus:outline-none focus:bg-highlight focus:text-dimshadow cursor-pointer`} onClick={handleYesAction}>
        <span className='font-extrabold'>y</span>es
      </button>
      /
      <button className={`hover:bg-highlight hover:text-dimshadow font-thin focus:outline-none focus:bg-highlight focus:text-dimshadow cursor-pointer`} onClick={handleNoAction}>
        <span className='font-extrabold'>n</span>o
      </button>
      {
        action === ACTION_TYPE.ACCEPT
          ? <>
            /
            <button className={`hover:bg-highlight hover:text-dimshadow font-thin focus:outline-none focus:bg-highlight focus:text-dimshadow cursor-pointer`} onClick={ignoreAction}>
              <span className='font-extrabold'>i</span>gnore
            </button>
          </>
          : <></>
      }
    </>
  )

  function handleYesAction() {
    if (!useAlternativeAction) {
      yesAction(friendIntraName, true);
    } else {
      alternativeAction(friendIntraName, true)
    }
  }

  function handleNoAction() {
    if (action === ACTION_TYPE.ACCEPT)
      noAction(friendIntraName, true);
    else
      ignoreAction();
  }
}

export default FriendActionConfirmationButtons;