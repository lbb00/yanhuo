import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { useUserStore } from '../../store/userStore'
import './index.scss'

export default function Index () {
  const { t, i18n } = useTranslation()
  const { user, login, logout } = useUserStore()

  const handleLogin = () => {
    login({ id: '01ARZ3NDEKTSV4RRFFQ69G5FAV', phone: '13800000000', nickname: 'Test User' }, 'mock_token')
  }

  const toggleLanguage = () => {
    const nextLng = i18n.language === 'zh' ? 'en' : 'zh'
    i18n.changeLanguage(nextLng)
  }

  return (
    <View className='index'>
      <View className='header'>
        <Text className='title'>烟火厨房</Text>
        <Text className='subtitle'>记录你的烹饪生活</Text>
        <Button size='mini' onClick={toggleLanguage} style={{marginTop: '10px'}}>{i18n.language === 'zh' ? 'EN' : '中'}</Button>
      </View>

      <View className='menu-grid'>
        <View className='menu-item' onClick={() => Taro.navigateTo({ url: '/pages/social/feed/index' })}>
          <Text>📱 {t('social_feed')}</Text>
        </View>
        <View className='menu-item' onClick={() => Taro.navigateTo({ url: '/pages/wiki/ingredients/index' })}>
          <Text>🥬 {t('wiki')}</Text>
        </View>
        <View className='menu-item'>
          <Text>🥘 {t('recipes')}</Text>
        </View>
        <View className='menu-item' onClick={() => Taro.navigateTo({ url: '/pages/smart/index' })}>
          <Text>🍳 {t('smart_tool')}</Text>
        </View>
      </View>

      <View className='user-section'>
        {user ? (
          <View>
            <Text>{t('hello')}, {user.nickname}</Text>
            <Button size='mini' onClick={() => Taro.navigateTo({ url: '/pages/user/profile/index' })}>
              {t('profile')}
            </Button>
            <Button size='mini' onClick={logout}>{t('logout')}</Button>
          </View>
        ) : (
          <Button onClick={handleLogin}>{t('login')}</Button>
        )}
      </View>
    </View>
  )
}
