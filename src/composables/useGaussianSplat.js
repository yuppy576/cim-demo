import * as Cesium from 'cesium'

export function useGaussianSplat(viewer) {
  let splatEntity = null

  // 加载 glTF 模型（模拟高斯泼溅）
  const addSplat = async (position, modelUrl) => {
    removeSplat()

    const pos = Cesium.Cartesian3.fromDegrees(position.lng, position.lat, position.height || 0)
    const heading = Cesium.Math.toRadians(0)
    const pitch = 0
    const roll = 0
    const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll)

    splatEntity = viewer.entities.add({
      name: '高斯泼溅演示模型',
      position: pos,
      orientation: Cesium.Transforms.headingPitchRollQuaternion(pos, hpr),
      model: {
        uri: modelUrl || '/models/sample.glb',
        scale: 20,
        color: Cesium.Color.WHITE.withAlpha(0.85),
        colorBlendMode: Cesium.ColorBlendMode.MIX
      }
    })

    viewer.camera.flyTo({ destination: pos, offset: new Cesium.HeadingPitchRange(0, -0.5, 200) })
  }

  const removeSplat = () => {
    if (splatEntity) {
      viewer.entities.remove(splatEntity)
      splatEntity = null
    }
  }

  const toggleSplat = (visible, position, modelUrl) => {
    if (visible) addSplat(position, modelUrl)
    else removeSplat()
  }

  return { addSplat, removeSplat, toggleSplat }
}
