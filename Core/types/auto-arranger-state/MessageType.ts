export const MessageTypes = <const>['SUCCESS', 'ERROR', 'WARNING', 'INFORMATION'];

type MessageType = typeof MessageTypes[number];

export default MessageType;
