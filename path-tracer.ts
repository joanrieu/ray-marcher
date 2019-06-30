namespace PathTracer {
  type Scene = {
    meshes: Mesh[];
    ambientColor: Color;
  };

  type Geometry = Sphere | Plane;

  type Sphere = {
    type: "sphere";
    center: Vec3;
    radius: number;
  };

  type Plane = {
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
    distance: number;
    isClose: boolean;
    mesh: Mesh;
  };

  type Mesh<T extends Geometry = Geometry> = {
    material: Material;
    geometry: T;
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
    ],
    ambientColor: [255, 0, 255]
  };

  const camera: Camera = {
    position: [0, 0, 5],
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
    const ctx = canvas.getContext("2d")!;
    const image = ctx.createImageData(canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; ++y) {
      for (let x = 0; x < canvas.width; ++x) {
        const ray = pixel2ray([x, y], camera);
        const color = trace_ray(ray, scene);

        image.data[y * 4 * canvas.width + x * 4 + 0] = color[0];
        image.data[y * 4 * canvas.width + x * 4 + 1] = color[1];
        image.data[y * 4 * canvas.width + x * 4 + 2] = color[2];
        image.data[y * 4 * canvas.width + x * 4 + 3] = color[3];
      }
    }

    ctx.putImageData(image, 0, 0);
  }

  function trace_ray(ray: Ray, scene: Scene) {
    const intersection = find_intersection(ray, scene);
    const path = { ray, intersection };
    const color = path2color(path, scene);
    return color;
  }

  function find_intersection(ray: Ray, scene: Scene) {
    let point = ray.origin;
    let steps = 0;
    let intersection: Intersection;
    do {
      intersection = scene.meshes
        .map(mesh => find_intersection_once(point, mesh))
        .reduce((a, b) => (a.distance < b.distance ? a : b));
      point = add(point, scale(intersection.distance, ray.direction));
    } while (!intersection.isClose && ++steps < 100);
    if (intersection.isClose) return intersection;
  }

  function path2color(path: Path, scene: Scene) {
    return path.intersection
      ? [...path.intersection.mesh.material.color, 255]
      : scene.ambientColor;
  }

  function find_intersection_once(point: Vec3, mesh: Mesh): Intersection {
    const distance = mesh_distance(point, mesh);
    const isClose = distance < 0.1;
    return {
      distance,
      isClose,
      mesh
    };
  }

  function mesh_distance(point: Vec3, mesh: Mesh) {
    switch (mesh.geometry.type) {
      case "sphere":
        return sphere_distance(point, mesh.geometry);
      case "plane":
        return plane_distance(point, mesh.geometry);
    }
  }

  function sphere_distance(point: Vec3, sphere: Sphere) {
    return norm(subtract(sphere.center, point)) - sphere.radius;
  }

  function plane_distance(point: Vec3, plane: Plane) {
    const diagonal = subtract(point, plane.point);
    return dot_product(diagonal, plane.normal);
  }

  function dot_product([a, b, c]: Vec3, [d, e, f]: Vec3) {
    return a * d + b * e + c * f;
  }

  function add([a, b, c]: Vec3, [d, e, f]: Vec3): Vec3 {
    return [a + d, b + e, c + f];
  }

  function subtract([a, b, c]: Vec3, [d, e, f]: Vec3): Vec3 {
    return [a - d, b - e, c - f];
  }

  function normSq(v: Vec3) {
    return dot_product(v, v);
  }

  function norm(v: Vec3) {
    return Math.sqrt(normSq(v));
  }

  function normalize(v: Vec3): Vec3 {
    return scale(1 / norm(v), v);
  }

  function scale(s: number, [a, b, c]: Vec3): Vec3 {
    return [s * a, s * b, s * c];
  }

  function pixel2ray(pixel: Vec2, camera: Camera): Ray {
    const origin: Vec3 = [
      camera.position[0] + pixel[0] / 10,
      camera.position[1] - pixel[1] / 10,
      camera.position[2]
    ];
    return {
      origin,
      direction: normalize(subtract(camera.lookAt, camera.position))
    };
  }
}
