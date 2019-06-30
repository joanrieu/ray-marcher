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
    point: Vec3;
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
        const ray: Ray = pixel2ray([x, y]);
        const color = trace_ray(ray);

        image.data[y * 4 * canvas.width + x * 4 + 0] = color[0];
        image.data[y * 4 * canvas.width + x * 4 + 1] = color[1];
        image.data[y * 4 * canvas.width + x * 4 + 2] = color[2];
        image.data[y * 4 * canvas.width + x * 4 + 3] = color[3];
      }
    }

    ctx.putImageData(image, 0, 0);
  }

  function trace_ray(ray: Ray) {
    const intersection: Intersection = find_intersection(ray, scene);
    const path: Path = { ray, intersection };
    const color = path2color(path);
    return color;
  }

  function find_intersection(ray: Ray, scene: Scene): Intersection {
    let point = ray.origin;
    let intersection: Intersection;
    let steps = 0;
    do {
      ++steps;
      intersection = scene.meshes
        .map(mesh => find_intersection_once(point, mesh))
        .reduce((a, b) => (a.distance < b.distance ? a : b));
    } while (intersection.distance > 0.1 && steps < 10);
    return intersection;
  }

  function path2color(path: Path) {
    return path.intersection
      ? [...path.intersection.mesh.material.color, 255]
      : scene.ambientColor;
  }

  function find_intersection_once(point: Vec3, mesh: Mesh): Intersection {
    return {
      distance: mesh_distance(point, mesh),
      point,
      mesh
    };
  }

  function mesh_distance(point: Vec3, mesh: Mesh<Geometry>) {
    switch (mesh.geometry.type) {
      case "sphere":
        return sphere_distance(point, mesh.geometry);
    }
  }

  function sphere_distance(point: Vec3, sphere: Sphere) {
    return norm(subtract(sphere.center, point)) - sphere.radius;
  }

  function subtract([a, b, c]: Vec3, [d, e, f]: Vec3): Vec3 {
    return [a - d, b - e, c - f];
  }

  function normSq([a, b, c]: Vec3) {
    return a * a + b * b + c * c;
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

  function pixel2ray(pixel: Vec2): Ray {
    return {
      origin: camera.position,
      direction: normalize(camera.lookAt)
    };
  }
}
