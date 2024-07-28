describe('MessageUniqueWrapper', () => {
    let messageUniqueWrapper: MessageUniqueWrapper;  
    beforeEach(() => {
      messageUniqueWrapper = new MessageUniqueWrapper();
    });
  
    test('createMsg should return a unique shortId for a new message', () => {
      const peer = new Peer();
      peer.chatType = 1;
      peer.peerUid = '123';
      const msgId = 'msgId123';
  
      const key = `${msgId}|${peer.chatType}|${peer.peerUid}`;
      const hash = crypto.createHash('sha1').update(key);
      const expectedShortId = parseInt(hash.digest('hex').slice(0, 8), 16);
  
      const shortId = messageUniqueWrapper.createMsg(peer, msgId);
      
      expect(shortId).toBeDefined();
      expect(shortId).toBe(expectedShortId);
    });
  
    test('createMsg should return undefined if the same message is added again', () => {
      const peer = new Peer();
      peer.chatType = 1;
      peer.peerUid = '123';
      const msgId = 'msgId123';
  
      const shortId = messageUniqueWrapper.createMsg(peer, msgId);
      const secondShortId = messageUniqueWrapper.createMsg(peer, msgId);
      
      expect(shortId).toBeDefined();
      expect(secondShortId).toBeUndefined();
    });
  
    test('getMsgIdAndPeerByShortId should return the message and peer for a given shortId', () => {
      const peer = new Peer();
      peer.chatType = 1;
      peer.peerUid = '123';
      const msgId = 'msgId123';
      messageUniqueWrapper.createMsg(peer, msgId);
  
      const shortId = messageUniqueWrapper.getShortIdByMsgId(msgId);
      const result = messageUniqueWrapper.getMsgIdAndPeerByShortId(shortId);
      
      expect(result).toBeDefined();
      expect(result.MsgId).toBe(msgId);
      expect(result.Peer.chatType).toBe(peer.chatType);
      expect(result.Peer.peerUid).toBe(peer.peerUid);
    });
  
    test('getMsgIdAndPeerByShortId should return undefined if the shortId does not exist', () => {
      const peer = new Peer();
      peer.chatType = 1;
      peer.peerUid = '123';
      const msgId = 'msgId123';
  
      messageUniqueWrapper.createMsg(peer, msgId);
  
      const invalidShortId = 12345678;
      const result = messageUniqueWrapper.getMsgIdAndPeerByShortId(invalidShortId);
      
      expect(result).toBeUndefined();
    });
  
    test('getShortIdByMsgId should return the shortId for a given message Id', () => {
      const peer = new Peer();
      peer.chatType = 1;
      peer.peerUid = '123';
      const msgId = 'msgId123';
  
      messageUniqueWrapper.createMsg(peer, msgId);
  
      const shortId = messageUniqueWrapper.getShortIdByMsgId(msgId);
      
      expect(shortId).toBeDefined();
      expect(typeof shortId).toBe('number');
    });
  
    test('getShortIdByMsgId should return undefined if the message Id does not exist', () => {
      const peer = new Peer();
      peer.chatType = 1;
      peer.peerUid = '123';
      const msgId = 'msgId123';
  
      messageUniqueWrapper.createMsg(peer, msgId);
  
      const invalidMsgId = 'invalidMsgId';
      const shortId = messageUniqueWrapper.getShortIdByMsgId(invalidMsgId);
      
      expect(shortId).toBeUndefined();
    });
  });
