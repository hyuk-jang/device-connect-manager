const _ = require('underscore');
const deviceConnector = require('./device-connector');
const eventToPromise = require('event-to-promise');

/** Socket, Serial, Modbus(RTU, ASCII, TCP) 등의 접속 방식을 하나의 module로 관리 */
module.exports = (function () {
  let manager;
  let parent;
  return {
    /**
     * 장치 객체 Binding. 최초 1회만 수행하면 됨
     * @param {{connecttype: string, port: number|string, host: string}} config connecttype -> 'socket', 'serial', 'modbus'
     * @param {object} parentObj 이벤트를 직접 받고자 할 경우 지정.
     */
    init: (config, parentObj) => {
      try {
        if (config === undefined || config.connecttype === undefined || _.contains(deviceConnector, config.connecttype)) {
          throw new Error('connect Type이 없군요');
        }
        parent = typeof parentObj === 'object' ? parentObj : null;

        const Manager = deviceConnector[config.connecttype];
        manager = new Manager(config);

        // 데이터 바인딩
        manager.on('dcData', data => {
          if (parent !== null) {
            parent.emit('dcData', data);
          }
        });
        // 접속 끊김 바인딩
        manager.on('dcDisconnected', () => {
          if (parent !== null) {
            parent.emit('dcDisconnected');
          }
        });

        // 에러 발생 바인딩
        manager.on('dcError', err => {
          if (parent !== null) {
            parent.emit('dcError', err);
          }
        });

        return manager;
      } catch (error) {
        throw error;
      }
    },
    /**
     * Binding 된 Connector 객체에 connect Method 요청
     */
    connect: async() => {
      if (_.isEmpty(manager)) {
        throw new Error('정상적인 init를 먼저 수행하십시오.');
      }
      manager.connect();

      // Manager에 이벤트가 발생하기까지 기다림
      await eventToPromise.multi(manager, ['dcConnect'], ['dcClose', 'dcError']);

      return true;
    },
    /**
     * 접속한 장치 객체에게 명령 요청. 각 Binding 된 객체마다 각기 다른 옵션으로 수행
     * @param {string|Buffer|{}} msg socket, serial 접속 경우에는 일반적인 buffer msg이고, 각 접속 방식에 맞는 config object 일 수 있음
     */
    write: async msg => {
      if (_.isEmpty(manager)) {
        throw new Error('정상적인 init를 먼저 수행하십시오.');
      }
      await manager.write(msg);
      return true;
    }
  };
})();