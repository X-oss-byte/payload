import React from 'react';
import PropTypes from 'prop-types';

import Button from '../../../elements/Button';
import Popup from '../../../elements/Popup';
import BlockSelector from '../../field-types/Blocks/BlockSelector';

import './index.scss';

const baseClass = 'action-panel';

const ActionPanel = (props) => {
  const {
    addRow,
    removeRow,
    singularLabel,
    verticalAlignment,
    blockType,
    blocks,
    rowIndex,
    isHovered,
  } = props;

  const classes = [
    baseClass,
    `${baseClass}--vertical-alignment-${verticalAlignment}`,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div className={`${baseClass}__controls-container`}>
        <div className={`${baseClass}__controls`}>
          <Popup
            showOnHover
            size="wide"
            color="dark"
            horizontalAlign="center"
            buttonType="custom"
            button={(
              <Button
                className={`${baseClass}__remove-row`}
                round
                buttonStyle="none"
                icon="x"
                iconPosition="left"
                iconStyle="with-border"
                onClick={removeRow}
              />
            )}
          >
            Remove&nbsp;
            {singularLabel}
          </Popup>

          {blockType === 'blocks'
            ? (
              <Popup
                buttonType="custom"
                size="large"
                horizontalAlign="right"
                button={(
                  <Button
                    className={`${baseClass}__add-row`}
                    round
                    buttonStyle="none"
                    icon="plus"
                    iconPosition="left"
                    iconStyle="with-border"
                  />
                )}
                render={({ close }) => (
                  <BlockSelector
                    blocks={blocks}
                    addRow={addRow}
                    addRowIndex={rowIndex}
                    close={close}
                    parentIsHovered={isHovered}
                    watchParentHover
                  />
                )}
              />
            )
            : (
              <Popup
                showOnHover
                size="wide"
                color="dark"
                horizontalAlign="right"
                buttonType="custom"
                button={(
                  <Button
                    className={`${baseClass}__add-row`}
                    round
                    buttonStyle="none"
                    icon="plus"
                    iconPosition="left"
                    iconStyle="with-border"
                    onClick={addRow}
                  />
                )}
              >
                Add&nbsp;
                {singularLabel}
              </Popup>
            )}
        </div>
      </div>
    </div>
  );
};

ActionPanel.defaultProps = {
  singularLabel: 'Row',
  verticalAlignment: 'center',
  blockType: null,
  isHovered: false,
  blocks: [],
};

ActionPanel.propTypes = {
  singularLabel: PropTypes.string,
  addRow: PropTypes.func.isRequired,
  removeRow: PropTypes.func.isRequired,
  blockType: PropTypes.oneOf(['blocks', 'array']),
  blocks: PropTypes.arrayOf(
    PropTypes.shape({}),
  ),
  verticalAlignment: PropTypes.oneOf(['top', 'center', 'sticky']),
  isHovered: PropTypes.bool,
  rowIndex: PropTypes.number.isRequired,
};

export default ActionPanel;
