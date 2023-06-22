import { ChatroomData, MemberData } from "../../../../model/ChatRoomData";
import { UserData } from "../../../../model/UserData"

export interface ChannelMemberRole {
  memberInfo: UserData,
  role: 'admin' | 'member' | 'owner'
  isMuted: boolean,
  isBanned: boolean
}

export enum NewChannelError {
  INVALID_CHANNEL_NAME,
  INVALID_PASSWORD,
  INVALID_NEW_PASSWORD,
  REQUIRED_PASSWORD_TO_MAKE_CHANGES,
  WRONG_PASSWORD,
}

export enum ModeratorAction {
  KICK,
  UNKICK,
  BAN,
  UNBAN,
  MUTE,
  UNMUTE,
  PROMOTE,
  DEMOTE,
  NONE,
}

interface ModeratorActionData {
  memberInfo: ChannelMemberRole,
  actionType: ModeratorAction,
  willBeKicked: boolean,
}

export interface NewChannelState {
  members: ChannelMemberRole[],
  memberCount: number,
  inviteList: ChannelMemberRole[],
  moderatedList: ModeratorActionData[],
  channelName: string,
  isPrivate: boolean,
  isInviting: boolean,
  password: string | null,
  newPassword: string | null,
  isPasswordProtected: boolean,
  errors: NewChannelError[],
  isNewChannel: boolean,
  hasChanges: boolean,
  isOwner: boolean,
  isAdmin: boolean,
  isTryingToLeaveChannel: boolean,
  isTryingToDeleteChannel: boolean,
  deleteConfirmed: boolean,
  leaveConfirmed: boolean,
}

export const newChannelInitialState: NewChannelState = {
  members: [],
  memberCount: 0,
  inviteList: [],
  moderatedList: [],
  channelName: '',
  isPrivate: false,
  isInviting: false,
  isPasswordProtected: false,
  password: null,
  newPassword: null,
  errors: [],
  isNewChannel: true,
  hasChanges: false,
  isOwner: false,
  isAdmin: false,
  isTryingToDeleteChannel: false,
  isTryingToLeaveChannel: false,
  deleteConfirmed: false,
  leaveConfirmed: false,
}

export type NewChannelAction =
  | { type: 'SET_CHANNEL_VISIBILITY', isPrivate: boolean }
  | { type: 'SELECT_MEMBER', userInfo: UserData }
  | { type: 'DESELECT_MEMBER', userInfo: UserData }
  | { type: 'ASSIGN_AS_OWNER', intraName: string }
  | { type: 'ASSIGN_AS_ADMIN', intraName: string }
  | { type: 'ASSIGN_AS_MEMBER', intraName: string}
  | { type: 'SET_CHANNEL_NAME', channelName: string }
  | { type: 'SET_CHANNEL_PRIVACY', isPrivate: boolean }
  | { type: 'SET_CHANNEL_PASSWORD', password: string | null }
  | { type: 'SET_CHANNEL_NEW_PASSWORD', newPassword: string | null }
  | { type: 'SET_CHANNEL_INFO', chatroomData: ChatroomData, members: MemberData[] }
  | { type: 'ADD_ERROR', error: NewChannelError }
  | { type: 'INVITE_MEMBER', userInfo: UserData } // by default, invite will just invite as member
  | { type: 'REMOVE_INVITE', userInfo: UserData }
  | { type: 'MODERATOR_ACTION', moderatedMemberInfo: ChannelMemberRole, actionType: ModeratorAction }
  | { type: 'IS_EDIT_CHANNEL' }
  | { type: 'TOGGLE_IS_INVITING', isInviting: boolean }
  | { type: 'IS_OWNER', userInfo: UserData }
  | { type: 'IS_ADMIN', userInfo: UserData }
  | { type: 'RESET_ERRORS' }
  | { type: 'RESET_INVITE_LIST' }
  | { type: 'RESET' }
  | { type: 'CLONE_STATE', state: NewChannelState }
  | { type: 'READY_MODERATED_LIST' }
  | { type: 'CLEAR_MODERATED_LIST' }
  | { type: 'IS_TRYING_TO_DELETE_CHANNEL' }
  | { type: 'IS_TRYING_TO_LEAVE_CHANNEL' }
  | { type: 'CONFIRM_DELETE_CHANNEL' }
  | { type: 'CONFIRM_LEAVE_CHANNEL' }

export default function newChannelReducer(state = newChannelInitialState, action: NewChannelAction): NewChannelState {
  switch (action.type) {
    case 'SELECT_MEMBER': {
      if (state.members.find(member => member.memberInfo.intraName === action.userInfo.intraName)) {
        return state;
      }
      const memberRole: ChannelMemberRole = {
        memberInfo: action.userInfo,
        role: 'member',
        isBanned: false,
        isMuted: false,
      }
      return {
        ...state,
        members: [...state.members, memberRole],
      }
    }
    case 'DESELECT_MEMBER': {
      if (!state.members.find(member => member.memberInfo.intraName === action.userInfo.intraName)) {
        return state;
      }
      return {
        ...state,
        members: state.members.filter(member => member.memberInfo.intraName !== action.userInfo.intraName),
      }
    }
    case 'ASSIGN_AS_OWNER': {
      return {
        ...state,
        members: state.members.map(member => {
          if (member.memberInfo.intraName === action.intraName) {
            return {
              ...member,
              role: 'owner',
            }
          }
          return member
        }),
      }
    }
    case 'ASSIGN_AS_ADMIN': {
      return {
        ...state,
        members: state.members.map(member => {
          if (member.memberInfo.intraName === action.intraName) {
            return {
              ...member,
              role: 'admin',
            }
          }
          return member
        }),
      }
    }
    case 'ASSIGN_AS_MEMBER': {
      return {
        ...state,
        members: state.members.map(member => {
          if (member.memberInfo.intraName === action.intraName) {
            return {
              ...member,
              role: 'member',
            }
          }
          return member
        }),
      }
    }
    case 'ADD_ERROR': {
      return {
        ...state,
        errors: [...state.errors, action.error],
      }
    }
    case 'SET_CHANNEL_NAME': {
      return {
        ...state,
        channelName: action.channelName,
      }
    }
    case 'SET_CHANNEL_PASSWORD': {
      return {
        ...state,
        password: action.password,
      }
    }
    case 'SET_CHANNEL_NEW_PASSWORD': {
      return {
        ...state,
        newPassword: action.newPassword,
      }
    }
    case 'SET_CHANNEL_PRIVACY': {
      return {
        ...state,
        isPrivate: action.isPrivate,
      }
    }
    case 'SET_CHANNEL_INFO': {
      const { chatroomData, members } = action;
      return {
        ...state,
        channelName: chatroomData.channelName,
        isPrivate: chatroomData.isPrivate,
        password: chatroomData.password === null ? null : '',
        newPassword: null,
        members: members.map(member => {
          const role = member.isAdmin ? (chatroomData.owner?.intraName === member.user.intraName ? 'owner' : 'admin') : 'member';
          const memberRole: ChannelMemberRole = {
            memberInfo: member.user,
            role: role,
            isBanned: member.isBanned,
            isMuted: member.isMuted,
          }
          return memberRole;
        }),
        memberCount: chatroomData.memberCount
      }
    }
    case 'IS_EDIT_CHANNEL': {
      return {
        ...state,
        isNewChannel: false,
      }
    }
    case 'IS_OWNER': {
      const ownerData = state.members.find(member => member.role === 'owner');
      return {
        ...state,
        isOwner: ownerData?.memberInfo.intraName === action.userInfo.intraName,
      }
    }
    case 'TOGGLE_IS_INVITING': {
      return {
        ...state,
        isInviting: action.isInviting,
      }
    }
    case 'IS_ADMIN': {
      const isAdmin = state.members.find(member => member.memberInfo.intraName === action.userInfo.intraName && member.role === 'admin');
      return {
        ...state,
        isAdmin: isAdmin !== undefined,
      }
    }
    case 'INVITE_MEMBER': {
      if (state.inviteList.find(invitation => invitation.memberInfo.intraName === action.userInfo.intraName)) {
        return state;
      }
      return {
        ...state,
        inviteList: [...state.inviteList, { memberInfo: action.userInfo, role: 'member', isBanned: false, isMuted: false }],
      }
    }
    case 'REMOVE_INVITE': {
      if (!state.inviteList.find(invitation => invitation.memberInfo.intraName === action.userInfo.intraName)) {
        return state;
      }
      return {
        ...state,
        inviteList: state.inviteList.filter(invitation => invitation.memberInfo.intraName !== action.userInfo.intraName),
      }
    }
    case 'MODERATOR_ACTION': {
      const { moderatedMemberInfo, actionType } = action;

      function updateRole(previousRole: 'owner' | 'admin' | 'member') {
        switch (actionType) {
          case ModeratorAction.PROMOTE:
            return 'admin';
          case ModeratorAction.DEMOTE:
            return 'member';
          default:
            return previousRole;
        }
      }

      function updateBanStatus() {
        if (actionType === ModeratorAction.BAN) {
          return true;
        } else if (actionType === ModeratorAction.UNBAN) {
          return false;
        }
        return false;
      }

      function updateMuteStatus() {
        if (actionType === ModeratorAction.MUTE) {
          return true;
        } else if (actionType === ModeratorAction.UNMUTE) {
          return false;
        }
        return false;
      }

      function updateKickStatus() {
        if (actionType === ModeratorAction.KICK) {
          return true;
        } else if (actionType === ModeratorAction.UNKICK) {
          return false;
        }
        return false;
      }

      function updateModeratedList(actionType: ModeratorAction) {

        return state.moderatedList.map(moderatedMember => {
          if (moderatedMember.memberInfo.memberInfo.intraId === moderatedMemberInfo.memberInfo.intraId) {
            const updatedMemberInfo: ChannelMemberRole = {
              ...moderatedMember.memberInfo,
              role: updateRole(moderatedMember.memberInfo.role),
              isBanned: updateBanStatus(),
              isMuted: updateMuteStatus(),
            }
            return {memberInfo: updatedMemberInfo, actionType: actionType, willBeKicked: updateKickStatus()}
          } else {
            return moderatedMember;
          }
        })
      }

      // handle promote action
      if (actionType === ModeratorAction.PROMOTE) {
        const isAlreadyAdmin = state.members.find(member => member.memberInfo.intraName === moderatedMemberInfo.memberInfo.intraName && member.role === 'admin');
        if (isAlreadyAdmin) {
          return {
            ...state,
            moderatedList: updateModeratedList(ModeratorAction.NONE)
          }
        } else {
          return {
            ...state,
            moderatedList: updateModeratedList(ModeratorAction.PROMOTE)
          }
        }
      }

      // handle demote action
      if (actionType === ModeratorAction.DEMOTE) {
        const isAlreadyMember = state.members.find(member => member.memberInfo.intraName === moderatedMemberInfo.memberInfo.intraName && member.role === 'member');
        if (isAlreadyMember) {
          return {
            ...state,
            moderatedList: updateModeratedList(ModeratorAction.NONE)
          }
        } else {
          return {
            ...state,
            moderatedList: updateModeratedList(ModeratorAction.DEMOTE)
          }
        }
      }

      if (actionType === ModeratorAction.MUTE) {
        const alreadyMuted = state.members.find(member => member.memberInfo.intraId === moderatedMemberInfo.memberInfo.intraId && member.isMuted);
        if (alreadyMuted) {
          return {
            ...state,
            moderatedList: updateModeratedList(ModeratorAction.NONE)
          }
        } else {
          return {
            ...state,
            moderatedList: updateModeratedList(ModeratorAction.MUTE)
          }
        }
      }

      if (actionType === ModeratorAction.UNMUTE) {
        const alreadyUnmuted = state.members.find(member => member.memberInfo.intraId === moderatedMemberInfo.memberInfo.intraId && !member.isMuted);
        if (alreadyUnmuted) {
          return {
            ...state,
            moderatedList: updateModeratedList(ModeratorAction.NONE)
          }
        } else {
          return {
            ...state,
            moderatedList: updateModeratedList(ModeratorAction.UNMUTE)
          }
        }
      }

      if (actionType === ModeratorAction.BAN) {
        const alreadyBanned = state.members.find(member => member.memberInfo.intraId === moderatedMemberInfo.memberInfo.intraId && member.isBanned);
        if (alreadyBanned) {
          return {
            ...state,
            moderatedList: updateModeratedList(ModeratorAction.NONE)
          }
        } else {
          return {
            ...state,
            moderatedList: updateModeratedList(ModeratorAction.BAN)
          }
        }
      }

      if (actionType === ModeratorAction.UNBAN) {
        const alreadyUnbanned = state.members.find(member => member.memberInfo.intraId === moderatedMemberInfo.memberInfo.intraId && !member.isBanned);
        if (alreadyUnbanned) {
          return {
            ...state,
            moderatedList: updateModeratedList(ModeratorAction.NONE)
          }
        } else {
          return {
            ...state,
            moderatedList: updateModeratedList(ModeratorAction.UNBAN)
          }
        }
      }

      if (actionType === ModeratorAction.KICK) {
        const alreadyKicked = state.moderatedList.find(member => member.memberInfo.memberInfo.intraId === moderatedMemberInfo.memberInfo.intraId && member.willBeKicked);
        if (alreadyKicked) {
          return {
            ...state,
            moderatedList: updateModeratedList(ModeratorAction.NONE)
          }
        } else {
          return {
            ...state,
            moderatedList: updateModeratedList(ModeratorAction.KICK)
          }
        }
      }

      if (actionType === ModeratorAction.UNKICK) {
        const alreadyUnkicked = state.moderatedList.find(member => member.memberInfo.memberInfo.intraId === moderatedMemberInfo.memberInfo.intraId && !member.willBeKicked);
        if (alreadyUnkicked) {
          return {
            ...state,
            moderatedList: updateModeratedList(ModeratorAction.NONE)
          }
        } else {
          return {
            ...state,
            moderatedList: updateModeratedList(ModeratorAction.UNKICK)
          }
        }
      }
    }
    case 'RESET_ERRORS': {
      return {
        ...state,
        errors: [],
      }
    }
    case 'RESET_INVITE_LIST': {
      return {
        ...state,
        inviteList: [],
      }
    }
    case 'IS_TRYING_TO_LEAVE_CHANNEL': {
      return {
        ...state,
        isTryingToLeaveChannel: !state.isTryingToLeaveChannel,
      }
    }
    case 'IS_TRYING_TO_DELETE_CHANNEL': {
      return {
        ...state,
        isTryingToDeleteChannel: !state.isTryingToDeleteChannel,
      }
    }
    case 'CONFIRM_DELETE_CHANNEL': {
      return {
        ...state,
        deleteConfirmed: !state.deleteConfirmed,
      }
    }
    case 'CONFIRM_LEAVE_CHANNEL': {
      return {
        ...state,
        leaveConfirmed: !state.leaveConfirmed,
      }
    }
    case 'CLONE_STATE': {
      return action.state;
    }
    case 'READY_MODERATED_LIST': {
      const newModeratedList = state.members.map(member =>{
        return {
          memberInfo: member,
          actionType: ModeratorAction.NONE,
          willBeKicked: false,
        }
      });
      return {
        ...state,
        moderatedList: newModeratedList,
      }
    }
    case 'CLEAR_MODERATED_LIST': {
      return {
        ...state,
        moderatedList: [],
      }
    }
    case 'RESET': {
      return newChannelInitialState;
    }
    default:
      return state
  }
}