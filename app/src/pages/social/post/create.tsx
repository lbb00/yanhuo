import { View, Text, Button, Image, Input, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { useUserStore } from '../../../store/userStore'
import './create.scss'

export default function CreatePost() {
  const { user, token } = useUserStore()
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])

  const handleChooseImage = async () => {
    // Mock upload for now or use Taro.chooseImage
    // Since we don't have a real file server that accepts multipart in the Hono mock easily yet without middleware,
    // we will simulate an upload.

    // In real Taro:
    // const res = await Taro.chooseImage({ count: 1 })
    // const tempFilePaths = res.tempFilePaths
    // Taro.uploadFile(...)

    const mockUrl = 'https://placehold.co/600x400?text=New+Dish'
    setImages([...images, mockUrl])
  }

  const handleSubmit = async () => {
    if (!content) {
      Taro.showToast({ title: '写点什么吧', icon: 'none' })
      return
    }

    try {
      await Taro.request({
        url: 'http://localhost:3000/social/posts',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`
        },
        data: {
          content,
          images,
          visibility: 'PUBLIC'
        }
      })
      Taro.showToast({ title: '发布成功', icon: 'success' })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (err) {
      Taro.showToast({ title: '发布失败', icon: 'none' })
    }
  }

  if (!user) {
    return <View className='container'><Text>请先登录</Text></View>
  }

  return (
    <View className='create-post'>
      <Textarea
        className='content-input'
        placeholder='分享你的烹饪心得...'
        value={content}
        onInput={e => setContent(e.detail.value)}
      />

      <View className='image-list'>
        {images.map((img, idx) => (
          <Image key={idx} src={img} className='thumb' mode='aspectFill' />
        ))}
        <View className='add-btn' onClick={handleChooseImage}>
          <Text>+</Text>
        </View>
      </View>

      <Button className='submit-btn' onClick={handleSubmit}>发布</Button>
    </View>
  )
}

