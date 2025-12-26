import { View, Text, Image, ScrollView, Button } from '@tarojs/components'
import Taro, { useLoad, useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { useUserStore } from '../../../store/userStore'
import './index.scss'

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([])
  const { user } = useUserStore()

  const fetchFeed = async () => {
    try {
      const res = await Taro.request({
        url: 'http://localhost:3000/social/feed',
        method: 'GET'
      })
      setPosts(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useDidShow(() => {
    fetchFeed()
  })

  const goDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/social/post/detail?id=${id}` })
  }

  const goCreate = () => {
    if (!user) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    Taro.navigateTo({ url: '/pages/social/post/create' })
  }

  return (
    <View className='feed-container'>
      <ScrollView scrollY className='feed-list'>
        {posts.map(post => {
          const images = JSON.parse(post.images || '[]')
          return (
            <View key={post.id} className='post-card' onClick={() => goDetail(post.id)}>
              <View className='header'>
                <Text className='author'>{post.author?.nickname}</Text>
                <Text className='time'>刚刚</Text>
              </View>
              <Text className='content'>{post.content}</Text>
              {images.length > 0 && (
                <Image src={images[0]} className='cover-img' mode='aspectFill' />
              )}
              <View className='footer'>
                <Text>{post._count?.comments || 0} 评论</Text>
              </View>
            </View>
          )
        })}
      </ScrollView>

      <View className='fab' onClick={goCreate}>
        <Text>+</Text>
      </View>
    </View>
  )
}

