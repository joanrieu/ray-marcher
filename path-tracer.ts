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

  render();

  function render() {
    const canvas = document.createElement("canvas");
    canvas.width = screen.size[0];
    canvas.height = screen.size[1];
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const image = ctx.createImageData(canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; ++y) {
      for (let x = 0; x < canvas.width; ++x) {
        const pixel: Vec2 = [x, y];

        const ray: Ray = {
          origin: camera.position,
          direction: camera.lookAt
        };

        const mesh = scene.meshes[0];
        if (mesh.geometry.type !== "sphere") throw "TODO";

        const point: Vec3 = [
          mesh.geometry.center[0],
          mesh.geometry.center[1],
          mesh.geometry.center[2] + mesh.geometry.radius
        ];

        const intersection: Intersection = {
          mesh,
          point
        };

        const path: Path = {
          ray,
          intersection
        };

        const color = path.intersection
          ? [...path.intersection.mesh.material.color, 255]
          : [255, 0, 255, 255];

        image.data[y * 4 * canvas.width + x * 4 + 0] = color[0];
        image.data[y * 4 * canvas.width + x * 4 + 1] = color[1];
        image.data[y * 4 * canvas.width + x * 4 + 2] = color[2];
        image.data[y * 4 * canvas.width + x * 4 + 3] = color[3];
      }
    }

    ctx.putImageData(image, 0, 0);
  }
}
