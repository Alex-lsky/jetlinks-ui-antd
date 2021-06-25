import React, { useState } from 'react';
import { Radio, Icon, Pagination, Row, Col } from 'antd';
import Table, { ColumnProps } from 'antd/lib/table';
import styles from './index.less';
import { PaginationProps } from 'antd/lib/pagination';
import { isFunction } from 'lodash';

interface CardsProps {
  title: string | (() => React.ReactDOM | JSX.Element)
  columns: ColumnProps<any>[]
  dataSource: any[]
  pagination: PaginationProps
  cardItemRender: (data: any) => JSX.Element
  carItemClassName?: string
  bodyClassName?: string
  col?: number
  toolNode?: React.ReactNode
  extraTool?: React.ReactNode
}

function Cards(props: CardsProps) {
  const [type, setType] = useState('card')

  return (
    <div className={styles.cards}>
      <div className={styles.header}>
        {
          isFunction(props.title) ? props.title() : <span>{props.title}</span>
        }
        <div className={styles.header_tool}>
          <div className={styles.header_tool_extra}>
            {props.toolNode}
          </div>
          <Radio.Group value={type} onChange={e => {
            setType(e.target.value)
          }}>
            <Radio.Button value='table'>
              <Icon type="unordered-list" />
            </Radio.Button>
            <Radio.Button value='card'>
              <Icon type="appstore" />
            </Radio.Button>
          </Radio.Group>
        </div>
      </div>
      {props.extraTool}
      <div className={`${styles.content} ${props.bodyClassName || ''}`}>
        {
          type === 'card' ?
            <>
              <div className={styles.cards_items}>
                <Row gutter={[24, 16]}>
                  {
                    props.dataSource.map((item, index) =>
                      <Col
                        className={`${props.carItemClassName || ''}`}
                        span={24 / (props.col || 4)}
                        key={`car_${index}`}
                      >

                        {props.cardItemRender(item)}
                      </Col>
                    )
                  }
                </Row>
              </div>
              <div className={styles.pages}>
                <Pagination {...props.pagination} />
              </div>
            </> :
            <Table
              columns={props.columns}
              dataSource={props.dataSource}
              pagination={props.pagination}
              bodyStyle={{ backgroundColor: '#fff' }}
            />
        }
      </div>
    </div>
  );
}

export default Cards;
