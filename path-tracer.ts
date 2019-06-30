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
    origin: Vec3;
    lookAt: Vec3;
    up: Vec3;
    fov: number;
    near: number;
    far: number;
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
}