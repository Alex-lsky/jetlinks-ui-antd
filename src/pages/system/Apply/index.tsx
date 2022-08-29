import { PermissionButton, ProTableCard } from '@/components';
import ApplyCard from '@/components/ProTableCard/CardItems/applyCard';
import SearchComponent from '@/components/SearchComponent';
import useHistory from '@/hooks/route/useHistory';
import { getMenuPathByCode } from '@/utils/menu';
import { onlyMessage } from '@/utils/util';
import {
  DeleteOutlined,
  EditOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { ActionType, ProColumns } from '@jetlinks/pro-table';
import { Badge } from 'antd';
import { useRef, useState } from 'react';
import { useIntl } from 'umi';
import Service from './service';

export const service = new Service('application');

const Apply = () => {
  const actionRef = useRef<ActionType>();
  const history = useHistory();
  const [searchParams, setSearchParams] = useState<any>({});
  const { permission } = PermissionButton.usePermission('system/Apply');
  const intl = useIntl();

  const providerType = new Map();
  providerType.set('internal-standalone', '内部独立应用');
  providerType.set('wechat-webapp', '微信网站应用');
  providerType.set('internal-integrated', '内部集成应用');
  providerType.set('dingtalk-ent-app', '钉钉企业内部应用');
  providerType.set('third-party', '第三方应用');

  const _action = (id: string, data: any) => {
    service.modify(id, data).then((res) => {
      if (res.status === 200) {
        onlyMessage('操作成功');
        actionRef.current?.reload();
      } else {
        onlyMessage('操作失败', 'error');
      }
    });
  };

  const columns: ProColumns<any>[] = [
    {
      dataIndex: 'name',
      ellipsis: true,
      title: '名称',
    },
    {
      dataIndex: 'provider',
      title: '类型',
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        'internal-standalone': {
          text: '内部独立应用',
          status: 'internal-standalone',
        },
        'wechat-webapp': {
          text: '微信网站应用',
          status: 'wechat-webapp',
        },
        'internal-integrated': {
          text: '内部集成应用',
          status: 'internal-integrated',
        },
        'dingtalk-ent-app': {
          text: '钉钉企业内部应用',
          status: 'dingtalk-ent-app',
        },
        'third-party': {
          text: '第三方应用',
          status: 'third-party',
        },
      },
      renderText: (provider) => <>{providerType.get(provider)}</>,
    },
    {
      dataIndex: 'state',
      title: '状态',
      valueType: 'select',
      renderText: (state) => (
        <Badge
          text={state === 'disabled' ? '禁用' : '正常'}
          status={state === 'disabled' ? 'error' : 'success'}
        />
      ),
      valueEnum: {
        disabled: {
          text: '禁用',
          status: 'disabled',
        },
        enabled: {
          text: '正常',
          status: 'enabled',
        },
      },
    },
    {
      dataIndex: 'description',
      ellipsis: true,
      title: '说明',
    },
    {
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      render: (text, record) => [
        <PermissionButton
          isPermission={permission.update}
          key="edit"
          onClick={() => {
            // setCurrent(record);
            // setVisible(true);
          }}
          type={'link'}
          style={{ padding: 0 }}
          tooltip={{
            title: intl.formatMessage({
              id: 'pages.data.option.edit',
              defaultMessage: '编辑',
            }),
          }}
        >
          <EditOutlined />
        </PermissionButton>,
        <PermissionButton
          isPermission={permission.action}
          key="action"
          type={'link'}
          style={{ padding: 0 }}
          tooltip={{
            title: record.state !== 'disabled' ? '禁用' : '启用',
          }}
          popConfirm={{
            title: `确认${record.state === 'disabled' ? '禁用' : '启用'}`,
            onConfirm: () => {
              if (record.state === 'disabled') {
                _action(record.id, {
                  state: 'enabled',
                });
              } else {
                _action(record.id, {
                  state: 'disabled',
                });
              }
            },
          }}
        >
          {record.state !== 'disabled' ? <StopOutlined /> : <PlayCircleOutlined />}
        </PermissionButton>,
        <PermissionButton
          isPermission={permission.delete}
          tooltip={{
            title: record.state !== 'disabled' ? '删除' : '请先禁用该应用，再删除',
          }}
          style={{ padding: 0 }}
          disabled={record.state !== 'disabled'}
          popConfirm={{
            title: '确认删除',
            disabled: record.state !== 'disabled',
            onConfirm: async () => {
              const resp: any = await service.remove(record.id);
              if (resp.status === 200) {
                onlyMessage(
                  intl.formatMessage({
                    id: 'pages.data.option.success',
                    defaultMessage: '操作成功!',
                  }),
                );
                actionRef.current?.reload();
              } else {
                onlyMessage(resp?.message || '操作失败', 'error');
              }
            },
          }}
          key="delete"
          type="link"
        >
          <DeleteOutlined />
        </PermissionButton>,
      ],
    },
  ];

  return (
    <PageContainer>
      <SearchComponent
        field={columns}
        target="Apply"
        onSearch={(data) => {
          actionRef.current?.reset?.();
          setSearchParams(data);
        }}
      />
      <ProTableCard
        columns={columns}
        actionRef={actionRef}
        scroll={{ x: 1366 }}
        params={searchParams}
        columnEmptyText={''}
        options={{ fullScreen: true }}
        request={(params) =>
          service.query({
            ...params,
            sorts: [
              {
                name: 'createTime',
                order: 'desc',
              },
            ],
          })
        }
        rowKey="id"
        search={false}
        pagination={{ pageSize: 10 }}
        headerTitle={[
          <PermissionButton
            onClick={() => {
              const url = getMenuPathByCode('system/Apply/Save');
              history.push(url);
            }}
            style={{ marginRight: 12 }}
            isPermission={permission.add}
            key="button"
            icon={<PlusOutlined />}
            type="primary"
          >
            新增
          </PermissionButton>,
        ]}
        gridColumn={3}
        cardRender={(record) => (
          <ApplyCard
            {...record}
            actions={[
              <PermissionButton
                isPermission={permission.update}
                key="edit"
                onClick={() => {
                  // setCurrent(record);
                  // setVisible(true);
                }}
                type={'link'}
                style={{ padding: 0 }}
                tooltip={{
                  title: intl.formatMessage({
                    id: 'pages.data.option.edit',
                    defaultMessage: '编辑',
                  }),
                }}
              >
                <EditOutlined />
                编辑
              </PermissionButton>,
              <PermissionButton
                isPermission={permission.action}
                key="action"
                type={'link'}
                style={{ padding: 0 }}
                tooltip={{
                  title: record.state !== 'disabled' ? '禁用' : '启用',
                }}
                popConfirm={{
                  title: `确认${record.state !== 'disabled' ? '禁用' : '启用'}`,
                  onConfirm: () => {
                    if (record.state === 'disabled') {
                      _action(record.id, {
                        state: 'enabled',
                      });
                    } else {
                      _action(record.id, {
                        state: 'disabled',
                      });
                    }
                  },
                }}
              >
                {record.state !== 'disabled' ? <StopOutlined /> : <PlayCircleOutlined />}
                {record.state !== 'disabled' ? '禁用' : '启用'}
              </PermissionButton>,
              <PermissionButton
                isPermission={permission.delete}
                tooltip={{
                  title: record.state === 'disabled' ? '删除' : '请先禁用该应用，再删除',
                }}
                disabled={record.state !== 'disabled'}
                popConfirm={{
                  title: '确认删除',
                  disabled: record.state !== 'disabled',
                  onConfirm: async () => {
                    // const resp: any = await service.remove(record.id);
                    // if (resp.status === 200) {
                    //     onlyMessage(
                    //         intl.formatMessage({
                    //             id: 'pages.data.option.success',
                    //             defaultMessage: '操作成功!',
                    //         }),
                    //     );
                    //     actionRef.current?.reload();
                    // } else {
                    //     onlyMessage(resp?.message || '操作失败', 'error');
                    // }
                  },
                }}
                key="delete"
                type="link"
              >
                <DeleteOutlined />
              </PermissionButton>,
            ]}
          />
        )}
      />
    </PageContainer>
  );
};
export default Apply;
