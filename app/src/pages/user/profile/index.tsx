import { View, Text, Image, Button } from '@tarojs/components'
import Taro, { useLoad, useRouter } from '@tarojs/taro'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUserStore } from '../../../store/userStore'
import './index.scss'

export default function Profile() {
  const { t } = useTranslation()
  const { user: currentUser } = useUserStore()
  const router = useRouter()
  // If id is passed, view other user; else view self (requires login)
  const id = router.params.id ? router.params.id : (currentUser?.id || '')

  const [profile, setProfile] = useState<any>(null)
  const [activity, setActivity] = useState<Record<string, number>>({})

  const fetchProfile = async () => {
    if (!id) return
    try {
      const res = await Taro.request({
        url: `http://localhost:3000/users/${id}/profile`,
        method: 'GET'
      })
      setProfile(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchActivity = async () => {
    if (!id) return
    try {
      const res = await Taro.request({
        url: `http://localhost:3000/users/${id}/activity`,
        method: 'GET'
      })
      setActivity(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useLoad(() => {
    if (!id) {
      Taro.showToast({ title: 'Please login', icon: 'none' })
      return
    }
    fetchProfile()
    fetchActivity()
  })

  // Mock Graph Renderer
  const renderGraph = () => {
    // Generate simple 7x52 grid for last year
    // This is a simplified visual representation
    const days = []
    const now = new Date()
    for (let i = 0; i < 100; i++) { // Show last 100 days for mobile space
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const count = activity[dateStr] || 0

      let level = 'level-0'
      if (count > 0) level = 'level-1'
      if (count > 3) level = 'level-2'
      if (count > 6) level = 'level-3'

      days.unshift(<View key={dateStr} className={`day ${level}`} />)
    }
    return <View className='graph-grid'>{days}</View>
  }

  if (!profile) return <View>Loading...</View>

  return (
    <View className='profile-container'>
      <View className='header'>
        <View className='avatar-placeholder'>
          {profile.avatar && <Image src={profile.avatar} className='avatar' />}
        </View>
        <Text className='nickname'>{profile.nickname || 'User'}</Text>
        <Text className='bio'>{profile.bio || 'This user is lazy...'}</Text>
      </View>

      <View className='stats'>
        <View className='stat-item'>
          <Text className='num'>{profile._count?.posts || 0}</Text>
          <Text className='label'>{t('posts')}</Text>
        </View>
        <View className='stat-item'>
          <Text className='num'>{profile._count?.followers || 0}</Text>
          <Text className='label'>{t('followers')}</Text>
        </View>
        <View className='stat-item'>
          <Text className='num'>{profile._count?.following || 0}</Text>
          <Text className='label'>{t('following')}</Text>
        </View>
      </View>

      <View className='activity-section'>
        <Text className='title'>{t('cooking_graph')}</Text>
        {renderGraph()}
      </View>

      {/* Action Buttons */}
      {currentUser && currentUser.id !== id && (
        <Button className='follow-btn'>Follow</Button>
      )}
    </View>
  )
}

