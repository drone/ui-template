import React from 'react'
import { Classes, Menu } from '@blueprintjs/core'
import { Button, ButtonProps } from '@wings-software/uicore'

export const MenuDivider = '-' as const

export interface OptionsMenuButtonProps extends ButtonProps {
  items: Array<React.ComponentProps<typeof Menu.Item> | '-'>
}

export const OptionsMenuButton: React.FC<OptionsMenuButtonProps> = ({ items, ...props }) => {
  return (
    <Button
      minimal
      icon="Options"
      tooltipProps={{ isDark: true, interactionKind: 'click', hasBackdrop: true }}
      tooltip={
        <Menu style={{ minWidth: 'unset' }}>
          {items.map(
            (item, index) =>
              ((item as string) === MenuDivider && <Menu.Divider key={index} />) || (
                <Menu.Item
                  key={(item as React.ComponentProps<typeof Menu.Item>).text as string}
                  className={Classes.POPOVER_DISMISS}
                  {...item}
                />
              )
          )}
        </Menu>
      }
      {...props}
    />
  )
}
