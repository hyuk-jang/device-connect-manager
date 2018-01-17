const bcjh = require('base-class-jh');

/** Class Socket 접속 클라이언트 클래스 */
class ClientForSocket extends bcjh.socket.SocketClient {
  /**
   * Socket Client 접속 설정 정보
   * @param {{port: number, ip: string}} port Socket Port
   */
  constructor(config) {
    super(config);
    this._eventHandler();
  }

  /**
   * Device 실제 연결. 연결 성공 시 'connect' event 발생
   */
  async connect() {
    await super.connect();
    this.emit('dcConnect');
    return this;
  }

  /**
   * Socket Server로 메시지 전송
   * @param {Buffer|String} 전송 데이터
   * @return {promise} Promise 반환 객체
   */
  write(msg) {
    let res = this.client.write(msg);
    if(res){
      return Promise.resolve();
    } else {
      return Promise.reject(res);
    }
  }

  /**
   * data 수신 Event Handler Binding
   */
  _eventHandler() {
    super.on('data', data => {
      console.log('receive', data);
      return this.emit('dcData', data);
    });

    super.on('close', () => {
      return this.emit('dcClose');
    });

    super.on('error', err => {
      return this.emit('dcError', err);
    });
  }
}
module.exports = ClientForSocket;