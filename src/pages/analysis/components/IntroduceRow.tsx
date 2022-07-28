import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Spin } from 'antd';
import Charts from './Charts';
import numeral from 'numeral';
import { IVisitData } from '../data.d';
import apis from '@/services';
import moment from 'moment';
import { getWebsocket } from '@/layouts/GlobalWebSocket';
import encodeQueryParam from '@/utils/encodeParam';
import onlineImg from '../img/online.png';
import GaugeCharts from './Charts/GaugeCharts';


const { MiniBar } = Charts;

interface State {
  cpu: number;
  memoryMax: number;
  memoryUsed: number;
  messageData: any[];
  sameDay: number;
  month: number;
  metadata: any;
  eventData: any[];
}

const topColResponsiveProps = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 6,
  style: { marginBottom: 24 },
};

const IntroduceRow = ({ loading, visitData }: { loading: boolean; visitData: IVisitData[] }) => {
  const initState: State = {
    cpu: 0,
    memoryMax: 0,
    memoryUsed: 0,
    messageData: [],
    sameDay: 0,
    month: 0,
    metadata: {},
    eventData: [],
  };

  const [cpu, setCpu] = useState(initState.cpu);
  const [memoryMax, setMemoryMax] = useState(initState.memoryMax);
  const [memoryUsed, setMemoryUsed] = useState(initState.memoryUsed);
  const [sameDay, setSameDay] = useState(initState.sameDay);
  const [month, setMonth] = useState(initState.month);
  const [deviceOnline, setDeviceOnline] = useState(initState.month);
  const [deviceCount, setDeviceCount] = useState(initState.month);
  const [deviceNotActive, setDeviceNotActive] = useState(initState.month);
  const [messageData] = useState(initState.messageData);
  const [deviceCountSpinning, setDeviceCountSpinning] = useState(true);
  const [deviceMessageSpinning, setDeviceMessageSpinning] = useState(true);

  const calculationDate = () => {
    const dd = new Date();
    dd.setDate(dd.getDate() - 30);
    const y = dd.getFullYear();
    const m = (dd.getMonth() + 1) < 10 ? `0${dd.getMonth() + 1}` : (dd.getMonth() + 1);
    const d = dd.getDate() < 10 ? `0${dd.getDate()}` : dd.getDate();
    return `${y}-${m}-${d} 00:00:00`;
  };

  const deviceMessage = () => {
    const list = [
      {
        'dashboard': 'device',
        'object': 'message',
        'measurement': 'quantity',
        'dimension': 'agg',
        'group': 'sameDay',
        'params': {
          'time': '1d',
          'format': 'yyyy-MM-dd',
        },
      },
      {
        'dashboard': 'device',
        'object': 'message',
        'measurement': 'quantity',
        'dimension': 'agg',
        'group': 'sameMonth',
        'params': {
          'limit': 30,
          'time': '1d',
          'format': 'yyyy-MM-dd',
          'from': calculationDate(),
          'to': moment(new Date()).format('YYYY-MM-DD') + ' 23:59:59'
        },
      },
      {
        'dashboard': 'device',
        'object': 'message',
        'measurement': 'quantity',
        'dimension': 'agg',
        'group': 'month',
        'params': {
          'time': '1M',
          'format': 'yyyy-MM-dd',
          'from': moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
          'to': moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        },
      },
    ];
    apis.analysis.getMulti(list)
      .then((response: any) => {
        const tempResult = response?.result;
        if (response.status === 200) {
          tempResult.forEach((item: any) => {
            switch (item.group) {
              case 'sameDay':
                setSameDay(item.data.value);
                break;
              case 'month':
                setMonth(item.data.value);
                break;
              case 'sameMonth':
                messageData.push(
                  {
                    'x': moment(new Date(item.data.timeString)).format('YYYY-MM-DD'),
                    'y': Number(item.data.value),
                  });
                break;
              default:
                break;
            }
          });
        }
        setDeviceMessageSpinning(false);
      });
  };

  const deviceStatus = () => {
    const list = [
      // 设备状态信息-在线
      // {
      //   'dashboard': 'device',
      //   'object': 'status',
      //   'measurement': 'record',
      //   'dimension': 'current',
      //   'group': 'deviceOnline',
      //   'params': {
      //     'state': 'online',
      //   },
      // },
      // 设备状态信息-历史在线
      {
        dashboard: 'device',
        object: 'session',
        measurement: 'online',
        dimension: 'agg',
        group: 'aggOnline',
        params: {
          state: 'online',
          limit: 15,
          from: 'now-15d',
          time: '1d',
          format: 'yyyy-MM-dd',
        },
      },
      // 设备状态信息-总数
      // {
      //   'dashboard': 'device',
      //   'object': 'status',
      //   'measurement': 'record',
      //   'dimension': 'current',
      //   'group': 'deviceCount',
      // },// 设备状态信息-未激活
      // {
      //   'dashboard': 'device',
      //   'object': 'status',
      //   'measurement': 'record',
      //   'dimension': 'current',
      //   'group': 'deviceNotActive',
      //   'params': {
      //     'state': 'notActive',
      //   },
      // },// 设备状态信息-历史在线
      // {
      //   'dashboard': 'device',
      //   'object': 'status',
      //   'measurement': 'record',
      //   'dimension': 'aggOnline',
      //   'group': 'aggOnline',
      //   'params': {
      //     'limit': 20,
      //     'time': '1d',
      //     'format': 'yyyy-MM-dd',
      //   },
      // },
    ];
    apis.analysis.getMulti(list)
      .then((response: any) => {
        const tempResult = response?.result;
        if (response.status === 200) {
          tempResult.forEach((item: any) => {
            switch (item.group) {
              case 'aggOnline':
                visitData.push(
                  {
                    'x': moment(new Date(item.data.timeString)).format('YYYY-MM-DD'),
                    'y': Number(item.data.value),
                  });
                break;
              // case 'deviceOnline':
              //   setDeviceOnline(item.data.value);
              //   break;
              // case 'deviceCount':
              //   setDeviceCount(item.data.value);
              //   break;
              // case 'deviceNotActive':
              //   setDeviceNotActive(item.data.value);
              //   break;
              default:
                break;
            }
          });
          visitData = visitData.reverse()
        }
        setDeviceCountSpinning(false);
      });

    apis.deviceInstance
      .count(
        encodeQueryParam({
          terms: {
            state: 'notActive'
          },
        }),
      )
      .then(res => {
        if (res.status === 200) {
          setDeviceNotActive(res.result);
        }
      })
      .catch();

    apis.deviceInstance
      .count({})
      .then(res => {
        if (res.status === 200) {
          setDeviceCount(res.result);
        }
      })
      .catch();
    // 设备在线
    apis.deviceInstance
      .count(
        encodeQueryParam({
          terms: {
            state: 'online'
          },
        }),
      )
      .then(res => {
        if (res.status === 200) {
          setDeviceOnline(res.result);
        }
      })
      .catch();
  };

  useEffect(() => {
    deviceStatus();
    deviceMessage();

    let tempCup = getWebsocket(
      `home-page-statistics-cpu-realTime`,
      `/dashboard/systemMonitor/cpu/usage/realTime`,
      {
        params: {
          'history': 1,
        },
      },
    ).subscribe(
      (resp: any) => {
        const { payload } = resp;
        setCpu(payload.value);
      },
    );

    let tempJvm = getWebsocket(
      `home-page-statistics-jvm-realTime`,
      `/dashboard/jvmMonitor/memory/info/realTime`,
      {
        params: {
          'history': 1,
        },
      },
    ).subscribe(
      (resp: any) => {
        const { payload } = resp;
        setMemoryMax(payload.value.max);
        setMemoryUsed(payload.value.used);
      },
    );

    return () => {
      tempCup && tempCup.unsubscribe();
      tempJvm && tempJvm.unsubscribe();
    };
  }, []);

  return (
    <Row gutter={24}>
      <Col {...topColResponsiveProps}>
        <Spin spinning={deviceCountSpinning}>
          <Card bordered={false}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #D8D8D8', paddingBottom: 15 }}>
              <div>
                <div style={{ color: '#1890FF', fontSize: 38 }}>{numeral(deviceOnline).format('0,0')}</div>
                <div style={{ color: 'rgba(0, 0, 0, 0.75)' }}>当前在线</div>
              </div>
              <div>
                <img src={onlineImg} />
              </div>
            </div>
            <div style={{ display: 'flex', whiteSpace: 'nowrap', overflow: 'hidden', paddingTop: 15 }}>
              <div style={{ display: 'flex', marginRight: 20 }}>
                <div style={{ color: '#2C3542', opacity: 0.65, marginRight: 10 }}>设备总量</div>
                <div style={{ color: '#323130' }}>{numeral(deviceCount).format('0,0')}</div>
              </div>
              <div style={{ display: 'flex' }}>
                <div style={{ color: '#2C3542', opacity: 0.65, marginRight: 10 }}>设备总量</div>
                <div style={{ color: '#323130' }}>{numeral(deviceNotActive).format('0,0')}</div>
              </div>
            </div>
          </Card>
        </Spin>
      </Col>

      <Col {...topColResponsiveProps}>
        <Spin spinning={deviceMessageSpinning}>
          <Card bordered={false}>
            <div style={{ borderBottom: '1px solid #D8D8D8', paddingBottom: 15 }}>
              <div style={{ color: 'rgba(0, 0, 0, 0.64)', fontSize: 16 }}>今日设备消息量</div>
              <div style={{ display: 'flex', height: 54, justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#4BCCA6', fontSize: 28 }}>{numeral(sameDay).format('0,0')}</div>
                <div style={{ width: '50%' }}><MiniBar color="#83D7CE" data={messageData} /></div>
              </div>
            </div>
            <div style={{ display: 'flex', whiteSpace: 'nowrap', overflow: 'hidden', paddingTop: 15 }}>
              <div style={{ display: 'flex', marginRight: 20 }}>
                <div style={{ color: '#2C3542', opacity: 0.65, marginRight: 10 }}>当月设备消息量</div>
                <div style={{ color: '#323130' }}>{numeral(month).format('0,0')}</div>
              </div>
            </div>
          </Card>
        </Spin>
      </Col>

      <Col {...topColResponsiveProps}>
        <Card bordered={false}>
          <div style={{ display: 'flex' }}>
            <div style={{ width: 120 }}>
              <div style={{ color: 'rgba(0, 0, 0, 0.64)', fontSize: 16 }}>CPU使用率</div>
              <div style={{ color: '#51C0DE', fontSize: 28, marginTop: 10 }}>{cpu}%</div>
            </div>
            <div style={{ width: 'calc(100% - 120px)', height: 130 }}>
              <GaugeCharts value={cpu} />
            </div>
          </div>
        </Card>
      </Col>

      <Col {...topColResponsiveProps}>
        <Card bordered={false}>
          <div style={{ display: 'flex' }}>
            <div style={{ width: 120 }}>
              <div style={{ color: 'rgba(0, 0, 0, 0.64)', fontSize: 16 }}>JVM内存</div>
              <div style={{ color: '#FAB247', fontSize: 28, marginTop: 10 }}>{(memoryUsed / 1024).toFixed(2)}G</div>
            </div>
            <div style={{ width: 'calc(100% - 120px)', height: 130 }}>
              <GaugeCharts value={(memoryUsed / 1024).toFixed(2)} max={Math.ceil(memoryMax / 1024)} formatter="G" />
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default IntroduceRow;
