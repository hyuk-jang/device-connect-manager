const bcjh = require('base-class-jh');
/** Class Serial Port 접속 클라이언트 클래스 */
class ClientForSerial extends bcjh.serial.SerialClient {
  /**
   * Serial Port 객체를 생성하기 위한 설정 정보
   * @param {{port: string, baud_rate: number, target_name: string}} config {port, baud_rate, raget_name}
   */
  constructor(config) {
    super(config);

    this._eventHandler();
  }


  /**
   * 장치로 접속
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
    return new Promise((resolve, reject) => {
      this.client.write(msg, err => {
        reject(err);
      });
      resolve();
    });
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

module.exports = ClientForSerial;