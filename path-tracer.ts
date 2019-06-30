namespace PathTracer {
  type Scene = {
    meshes: Mesh[];
  };

  type Geometry =
    | {
        type: "sphere";
        center: Vec3;
        radius: number;
      }
    | {
        type: "plane";
        point: Vec3;
        normal: Vec3;
      };

  type Vec3 = [number, number, number];

  type Camera = {
    position: Vec3;
    lookAt: Vec3;
    up: Vec3;
    fov: number;
    aspectRatio: number;
  };

  type Vec2 = [number, number];

  type Ray = {
    origin: Vec3;
    direction: Vec3;
  };

  type Screen = {
    size: Vec2;
  };

  type Material = {
    color: Color;
  };

  type Color = [number, number, number];

  type Path = {
    ray: Ray;
    intersection?: Intersection;
  };

  type Intersection = {
    point: Vec3;
    normal: Vec3;
    mesh: Mesh;
  };

  type Mesh = {
    material: Material;
    geometry: Geometry;
  };

  const scene: Scene = {
    meshes: [
      {
        geometry: {
          type: "sphere",
          center: [0, 0, -5],
          radius: 1
        },
        material: {
          color: [255, 0, 0]
        }
      }
    ]
  };

  const camera: Camera = {
    position: [0, 0, -5],
    lookAt: [0, 0, 0],
    up: [0, 1, 0],
    fov: 90,
    aspectRatio: 3 / 2
  };

  const screen: Screen = {
    size: [30, 20]
  };
}
