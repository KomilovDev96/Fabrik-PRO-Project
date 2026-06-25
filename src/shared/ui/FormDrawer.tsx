import type { ReactNode } from 'react'
import { Button, Drawer, Flex, Grid } from 'antd'

interface FormDrawerProps {
  open: boolean
  title: ReactNode
  okText: string
  cancelText: string
  confirmLoading?: boolean
  onOk: () => void
  onClose: () => void
  children: ReactNode
}

/**
 * Standard right-side drawer for create/edit forms. Used everywhere instead of a
 * centered modal. Responsive width: 60% on desktop, 85% on tablets, 100% on phones.
 * Content is destroyed when hidden so embedded widgets (e.g. the map) re-init cleanly.
 */
export function FormDrawer({
  open,
  title,
  okText,
  cancelText,
  confirmLoading,
  onOk,
  onClose,
  children,
}: FormDrawerProps) {
  const screens = Grid.useBreakpoint()
  // antd v6: pass the custom width through `size` (`width` is deprecated).
  const size = screens.lg ? '60%' : screens.md ? '85%' : '100%'

  return (
    <Drawer
      open={open}
      title={title}
      size={size}
      onClose={onClose}
      destroyOnHidden
      maskClosable={!confirmLoading}
      footer={
        <Flex justify="flex-end" gap={8}>
          <Button onClick={onClose} disabled={confirmLoading}>
            {cancelText}
          </Button>
          <Button type="primary" onClick={onOk} loading={confirmLoading}>
            {okText}
          </Button>
        </Flex>
      }
    >
      {children}
    </Drawer>
  )
}
