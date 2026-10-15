import type { DeviceListItem, InventoryDevice } from './deviceInventory'
import type { DeviceScene } from './deviceScene'
type Translate = (text: string) => string

// Shared by the real device center and the design-only home summary.
export const deviceCategoryLabel = (scene: DeviceScene, t: Translate): string => ({
    phone:t('手机'),computer:t('电脑'),tablet:t('平板'),tv:t('电视与影音'),network:t('网络设备'),
    'smart-home':t('智能家居'),camera:t('摄像头'),gaming:t('游戏设备'),storage:t('存储与服务器'),
    printer:t('打印机'),wearable:t('穿戴设备'),unknown:t('未知设备'),
}[scene])
export const deviceDisplayName = (device: DeviceListItem, t: Translate): string => {
    const name = device.displayName || device.hostname || ''
    if (name) return name
    if (device.brand) return `${device.brand} ${device.classification.source === 'fallback' ? t('设备') : deviceCategoryLabel(device.scene,t)}`
    return t('未命名设备')
}
export const devicePresenceLabel = (device: Pick<InventoryDevice,'presenceState'|'online'>, t: Translate): string =>
    device.presenceState === 'never_seen' ? t('尚未上线') : device.online ? t('在线') : t('离线')
