import * as Cesium from 'cesium'
import rawGeoJson from '../wuhan_buildings_clip.json'

export function useBuildingLayer(viewer) {
  let dataSource = null
  let buildingMockDataMap = {}

  const structureTypes = ['框架-剪力墙', '框架结构', '剪力墙', '钢结构', '砖混结构']
  const usageTypes = ['商住综合', '住宅', '商业', '办公', '混合用途']

  const load = async () => {
    let geoJsonData = rawGeoJson
    if (geoJsonData.type === 'GeometryCollection' && Array.isArray(geoJsonData.geometries)) {
      geoJsonData = {
        type: 'FeatureCollection',
        features: geoJsonData.geometries.map((geom, idx) => ({
          type: 'Feature',
          properties: { id: idx },
          geometry: geom
        }))
      }
    }

    dataSource = await Cesium.GeoJsonDataSource.load(geoJsonData, {
      stroke: Cesium.Color.WHITE,
      fill: Cesium.Color.fromCssColorString('#4da6ff').withAlpha(0.55),
      strokeWidth: 2
    })
    viewer.dataSources.add(dataSource)

    const entities = dataSource.entities.values
    const allPositions = []

    const mockNames = [
      '东宝大厦', '荆门国际中心', '楚天商务楼', '龙泉大厦', '象山公寓',
      '荆楚科技园', '长宁商务楼', '金城广场', '银河大厦', '中天办公楼'
    ]

    entities.forEach((entity, i) => {
      if (entity.polygon) {
        let levels = 3 + Math.floor(Math.random() * 28)
        let height = levels * 3

        entity.polygon.extrudedHeight = height
        entity.polygon.outline = true
        entity.polygon.outlineColor = Cesium.Color.WHITE

        const buildId = i
        buildingMockDataMap[buildId] = {
          id: buildId,
          name: mockNames[i % mockNames.length] + ' ' + String.fromCharCode(65 + (i % 26)) + '座',
          levels: levels,
          height: height,
          year: 2000 + Math.floor(Math.random() * 24),
          address: '',
          structure: structureTypes[Math.floor(Math.random() * structureTypes.length)],
          usage: usageTypes[Math.floor(Math.random() * usageTypes.length)],
          totalUnits: levels * 4,
          selectedFloor: null
        }
        entity.buildId = buildId

        try {
          const hierarchy = entity.polygon.hierarchy?.getValue()
          if (hierarchy && hierarchy.positions) {
            hierarchy.positions.forEach(pos => allPositions.push(pos))
          }
        } catch (e) {}
      }
    })

    if (allPositions.length > 0) {
      const bs = Cesium.BoundingSphere.fromPoints(allPositions)
      viewer.camera.flyToBoundingSphere(bs, {
        duration: 3,
        offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-55), bs.radius * 2.2)
      })
    } else {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(112.20, 31.06, 5000),
        duration: 3
      })
    }
  }

  const getDataSource = () => dataSource
  const getMockDataMap = () => buildingMockDataMap

  return { load, getDataSource, getMockDataMap }
}
