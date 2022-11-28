import { useEffect, useState } from 'react';
import Modal from '../Modal/add';
import type { ActionsType } from '@/pages/rule-engine/Scene/typings';
import { DeleteOutlined } from '@ant-design/icons';
import './index.less';
import TriggerAlarm from '../TriggerAlarm';
import { AddButton } from '@/pages/rule-engine/Scene/Save/components/Buttons';
import FilterCondition from './FilterCondition';

export enum ParallelEnum {
  'parallel' = 'parallel',
  'serial' = 'serial',
}

export type ParallelType = keyof typeof ParallelEnum;
interface ItemProps {
  thenName: number;
  name: number;
  data: ActionsType;
  type: ParallelType;
  parallel: boolean;
  options: any;
  onUpdate: (data: any, options: any) => void;
  onDelete: () => void;
}

const iconMap = new Map();
iconMap.set('trigger', require('/public/images/scene/action-bind-icon.png'));
iconMap.set('notify', require('/public/images/scene/action-notify-icon.png'));
iconMap.set('device', require('/public/images/scene/action-device-icon.png'));
iconMap.set('relieve', require('/public/images/scene/action-unbind-icon.png'));
iconMap.set('delay', require('/public/images/scene/action-delay-icon.png'));

export const itemNotifyIconMap = new Map();
itemNotifyIconMap.set('dingTalk', require('/public/images/scene/notify-item-img/dingtalk.png'));
itemNotifyIconMap.set('weixin', require('/public/images/scene/notify-item-img/weixin.png'));
itemNotifyIconMap.set('email', require('/public/images/scene/notify-item-img/email.png'));
itemNotifyIconMap.set('voice', require('/public/images/scene/notify-item-img/voice.png'));
itemNotifyIconMap.set('sms', require('/public/images/scene/notify-item-img/sms.png'));
itemNotifyIconMap.set('webhook', require('/public/images/scene/notify-item-img/webhook.png'));

export default (props: ItemProps) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [triggerVisible, setTriggerVisible] = useState<boolean>(false);
  const [op, setOp] = useState<any>(props.options);

  useEffect(() => {
    setOp(props.options);
  }, [props.options]);

  const notifyRender = (data: ActionsType | undefined) => {
    switch (data?.notify?.notifyType) {
      case 'dingTalk':
        return (
          <div>
            向<span>{data?.options?.notifierName || data?.notify?.notifierId}</span>
            通过
            <span className={'notify-img-highlight'}>
              <img width={18} src={itemNotifyIconMap.get(data?.notify?.notifyType)} />
              钉钉
            </span>
            发送
            <span className={'notify-text-highlight'}>
              {data?.options?.templateName || data?.notify?.templateId}
            </span>
          </div>
        );
      case 'weixin':
        return (
          <div>
            向<span className={'notify-text-highlight'}>{data?.options?.sendTo || ''}</span>
            <span className={'notify-text-highlight'}>{data?.options?.orgName || ''}</span>
            <span className={'notify-text-highlight'}>{data?.options?.tagName || ''}</span>
            通过
            <span className={'notify-img-highlight'}>
              <img width={18} src={itemNotifyIconMap.get(data?.notify?.notifyType)} />
              微信
            </span>
            发送
            <span className={'notify-text-highlight'}>
              {data?.options?.templateName || data?.notify?.templateId}
            </span>
          </div>
        );
      case 'email':
        return (
          <div>
            向<span className={'notify-text-highlight'}>{data?.options?.sendTo || ''}</span>
            通过
            <span className={'notify-img-highlight'}>
              <img width={18} src={itemNotifyIconMap.get(data?.notify?.notifyType)} />
              邮件
            </span>
            发送
            <span className={'notify-text-highlight'}>
              {data?.options?.templateName || data?.notify?.templateId}
            </span>
          </div>
        );
      case 'voice':
        return (
          <div>
            向<span className={'notify-text-highlight'}>{data?.options?.calledNumber || ''}</span>
            通过
            <span className={'notify-img-highlight'}>
              <img width={18} src={itemNotifyIconMap.get(data?.notify?.notifyType)} />
              语音
            </span>
            发送
            <span className={'notify-text-highlight'}>
              {data?.options?.templateName || data?.notify?.templateId}
            </span>
          </div>
        );
      case 'sms':
        return (
          <div>
            向<span className={'notify-text-highlight'}>{data?.options?.sendTo || ''}</span>
            通过
            <span className={'notify-img-highlight'}>
              <img width={18} src={itemNotifyIconMap.get(data?.notify?.notifyType)} />
              短信
            </span>
            发送
            <span className={'notify-text-highlight'}>
              {data?.options?.templateName || data?.notify?.templateId}
            </span>
          </div>
        );
      case 'webhook':
        return (
          <div>
            通过
            <span className={'notify-img-highlight'}>
              <img width={18} src={itemNotifyIconMap.get(data?.notify?.notifyType)} />
              webhook
            </span>
            发送
            <span>{data?.options?.templateName || data?.notify?.templateId}</span>
          </div>
        );
      default:
        return null;
    }
  };

  const contentRender = () => {
    if (props?.data?.alarm?.mode === 'trigger') {
      return (
        <div>
          满足条件后将触发关联
          <a
            onClick={() => {
              setTriggerVisible(true);
            }}
          >
            关联此场景的告警
          </a>
        </div>
      );
    } else if (props?.data?.alarm?.mode === 'relieve') {
      return (
        <div>
          满足条件后将解除关联
          <a
            onClick={() => {
              setTriggerVisible(true);
            }}
          >
            关联此场景的告警
          </a>
        </div>
      );
    } else if (props?.data?.executor === 'notify') {
      return notifyRender(props?.data);
    } else if (props?.data?.executor === 'delay') {
      return <div> {props.options.name}</div>;
    } else if (props.data?.executor === 'device') {
      return <div></div>;
    }
    return (
      <AddButton
        onClick={() => {
          setVisible(true);
        }}
      >
        点击配置执行动作
      </AddButton>
    );
  };

  return (
    <div className="actions-item-warp">
      <div className="actions-item">
        <div className="item-options-warp">
          <div className="item-options-type">
            <img
              style={{ width: 48 }}
              src={iconMap.get(
                props?.data.executor === 'alarm' ? props?.data?.alarm?.mode : props?.data.executor,
              )}
            />
          </div>
          <div
            className={'item-options-content'}
            onClick={() => {
              setVisible(true);
            }}
          >
            {contentRender()}
          </div>
        </div>
        <div className="item-number">{props.name + 1}</div>
        <div className="item-delete" onClick={props.onDelete}>
          <DeleteOutlined />
        </div>
      </div>
      {props.parallel ? null : (
        <FilterCondition
          thenName={props.thenName}
          data={props.data.terms?.[0]}
          onAdd={() => {
            let _data = props.data;
            if (!_data.terms) {
              _data = {
                ..._data,
                terms: [{}],
              };
              props.onUpdate(_data, op);
            }
          }}
          onChange={(termsData) => {
            const _data = props.data;
            if (_data.terms) {
              _data.terms = [termsData];
              props.onUpdate(_data, op);
            }
          }}
          onDelete={() => {
            const _data = props.data;
            if (_data.terms) {
              delete _data.terms;
              props.onUpdate(_data, op);
            }
          }}
        />
      )}
      {visible && (
        <Modal
          name={props.name}
          data={props.data}
          close={() => {
            setVisible(false);
          }}
          save={(data: ActionsType, options) => {
            // FormModel.actions[props.name] = data;
            setOp(options);
            props.onUpdate(data, options);
            setVisible(false);
          }}
          type={props.type}
        />
      )}
      {triggerVisible && (
        <TriggerAlarm
          close={() => {
            setTriggerVisible(false);
          }}
        />
      )}
    </div>
  );
};
