import { useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import * as THREE from 'three';
import { PCDLoader } from '@loaders.gl/pcd';
import { PLYLoader } from '@loaders.gl/ply';
import useLoader from "../hooks/useLoader";

const POINT_BUDGET = 1000_000;

function randomSamplingTypedArray(
    positionsArray: Array<any>,
    pointCount: number,
    itemSizePositions: number
  ) {
    const totalPoints = positionsArray.length / itemSizePositions;
    if (pointCount > totalPoints) {
      throw new Error("pointCount is too large for the provided arrays.");
    }
  
    const sampledPositions = new Float32Array(pointCount * itemSizePositions);
  
    // Reservoir sampling for positions and colors
    for (let i = 0; i < pointCount; i++) {
      for (let j = 0; j < itemSizePositions; j++) {
        sampledPositions[i * itemSizePositions + j] =
          positionsArray[i * itemSizePositions + j];
      }
    }
  
    // Process the rest of the elements
    for (let i = pointCount; i < totalPoints; i++) {
      const pos = Math.floor(Math.random() * (i + 1));
      if (pos < pointCount) {
        for (let j = 0; j < itemSizePositions; j++) {
          sampledPositions[pos * itemSizePositions + j] =
            positionsArray[i * itemSizePositions + j];
        }
      }
    }
  
    return sampledPositions;
  }

  export function randomSamplingTwoArrays(
    positionsArray: Array<any>,
    colorsArray: Array<any>,
    pointCount: number,
    itemSizePositions: number,
    itemSizeColors: number
  ) {
    const totalPoints = positionsArray.length / itemSizePositions;
    if (pointCount > totalPoints) {
      throw new Error("pointCount is too large for the provided arrays.");
    }
  
    const sampledPositions = new Float32Array(pointCount * itemSizePositions);
    const sampledColors = new Float32Array(pointCount * itemSizeColors);
    
    
    // Reservoir sampling for positions and colors
    for (let i = 0; i < pointCount; i++) {
      for (let j = 0; j < itemSizePositions; j++) {
        sampledPositions[i * itemSizePositions + j] =
          positionsArray[i * itemSizePositions + j];
      }
      for (let j = 0; j < itemSizeColors; j++) {
        sampledColors[i * itemSizeColors + j] =
          colorsArray[i * itemSizeColors + j];
      }
    }
  
    /*
    // Process the rest of the elements
    for (let i = pointCount; i < totalPoints; i++) {
      const pos = Math.floor(Math.random() * (i + 1));
      if (pos < pointCount) {
        for (let j = 0; j < itemSizePositions; j++) {
          sampledPositions[pos * itemSizePositions + j] =
            positionsArray[i * itemSizePositions + j];
        }
        for (let j = 0; j < itemSizeColors; j++) {
          sampledColors[pos * itemSizeColors + j] =
            colorsArray[i * itemSizeColors + j];
        }
      }
    }
    */
  
    return { sampledPositions, sampledColors };
  }

const PLYPointCloud = (props: { file: File | null }) => {
  
    const { scene } = useThree();
    const [points, setPoints] = useState<any>();
  
    const { data, err, isLoading } = useLoader("/models/rescaled_fo.ply", PLYLoader);
  
    useEffect(() => {
      THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 0, 1);
    }, []);
  
    useEffect(() => {
      if (!isLoading && data) {
        const geometry = new THREE.BufferGeometry();
  
        //console.log("data", data);
  
        const vertexCount = data.header.vertexCount;
        const pointCount = Math.min(vertexCount, POINT_BUDGET);
  
        const {sampledPositions, sampledColors} = randomSamplingTwoArrays(
          data.attributes.POSITION.value,
          data.attributes.COLOR_0.value,
          vertexCount,
          data.attributes.POSITION.size,
          data.attributes.COLOR_0.size
        );
  
        
         for (let i = 0; i < sampledColors.length; i++) {
          sampledColors[i] = sampledColors[i] / 255;
         }
         
  
        geometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(sampledPositions, 3)
        );
        
         geometry.setAttribute(
           "color",
           new THREE.Float32BufferAttribute(sampledColors, 3)
         );
         
        //geometry.computeBoundingSphere();
  
        const material = new THREE.PointsMaterial({
          size: 1,
          //color: "#C4A484",
        });
        material.vertexColors = true;
        const points = new THREE.Points(geometry, material);
  
        setPoints(points);
      }
    }, [data, isLoading]);
  
    useEffect(() => {
      if (points) {
        scene.add(points);
  
        return () => {
          // Cleanup
          scene.remove(points);
          points.geometry.dispose();
          points.material.dispose();
        };
      }
    }, [points, scene]);
  
    return null;
  }

  export { PLYPointCloud };