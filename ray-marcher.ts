namespace RayMarcher {
  type Scene = {
    meshes: Mesh[];
    ambient_color: Color;
  };

  type Mesh = Sphere | Plane | MergedMesh;

  type Sphere = {
    type: "sphere";
    center: Vec3;
    radius: number;
    material: Material;
  };

  type Plane = {
    type: "plane";
    point: Vec3;
    normal: Vec3;
    material: Material;
  };

  type MergedMesh = {
    type: "merged_mesh";
    smoothing: number;
    meshes: Mesh[];
    material: Material;
  };

  type Vec3 = [number, number, number];

  type Camera = {
    position: Vec3;
    look_at: Vec3;
    up: Vec3;
  };

  type Vec2 = [number, number];

  type Ray = {
    origin: Vec3;
    direction: Vec3;
    head: Vec3;
  };

  type Screen = {
    size: Vec2;
  };

  type Material = {
    color: Color;
  };

  type Color = [number, number, number];

  type Projection = {
    distance: number;
    mesh: Mesh;
    normal: Vec3;
  };

  const scene: Scene = {
    meshes: [
      {
        type: "sphere",
        center: [0, 0, -5],
        radius: 1,
        material: {
          color: [255, 0, 0]
        }
      },
      {
        type: "plane",
        point: [0.4, 0, -5],
        normal: normalize([-1, 0, 1]),
        material: {
          color: [0, 0, 255]
        }
      },
      {
        type: "merged_mesh",
        smoothing: 0.5,
        meshes: [
          {
            type: "sphere",
            center: [-1.6, 1.5, -2],
            radius: 0.5,
            material: {
              color: [255, 0, 255]
            }
          },
          {
            type: "sphere",
            center: [-3, 1, -2],
            radius: 1,
            material: {
              color: [255, 255, 255]
            }
          }
        ],
        material: {
          color: [0, 255, 0]
        }
      }
    ],
    ambient_color: [50, 50, 50]
  };

  const camera: Camera = {
    position: [0, 0, 5],
    look_at: [0, 0, 0],
    up: [0, 1, 0]
  };

  const screen: Screen = {
    size: [800, 600]
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
        const ray = pixel2ray([x, y], screen, camera);
        const color = march_ray(ray, scene);

        image.data[y * 4 * canvas.width + x * 4 + 0] = color[0];
        image.data[y * 4 * canvas.width + x * 4 + 1] = color[1];
        image.data[y * 4 * canvas.width + x * 4 + 2] = color[2];
        image.data[y * 4 * canvas.width + x * 4 + 3] = 255;
      }
    }

    ctx.putImageData(image, 0, 0);
  }

  function march_ray(ray: Ray, scene: Scene) {
    let steps = 0;
    let projection: Projection;
    let is_close = false;
    do {
      projection = scene.meshes
        .map(mesh => project_point(ray.head, mesh))
        .reduce((a, b) => (a.distance < b.distance ? a : b));
      ray.head = add(ray.head, scale(projection.distance, ray.direction));
      is_close = projection.distance < 0.01;
    } while (!is_close && ++steps < 100);
    return is_close ? shade(ray, projection) : scene.ambient_color;
  }

  function shade(ray: Ray, projection: Projection) {
    const light = -dot_product(ray.direction, projection.normal);
    return scale(light, projection.mesh.material.color);
  }

  function project_point(point: Vec3, mesh: Mesh): Projection {
    return {
      sphere: project_point_on_sphere,
      plane: project_point_on_plane,
      merged_mesh: project_point_on_merged_mesh
    }[mesh.type](point, mesh as any);
  }

  function project_point_on_sphere(point: Vec3, sphere: Sphere): Projection {
    const vector = subtract(point, sphere.center);
    const distance = norm(vector) - sphere.radius;
    return {
      distance,
      mesh: sphere,
      normal: normalize(vector)
    };
  }

  function project_point_on_plane(point: Vec3, plane: Plane): Projection {
    const diagonal = subtract(point, plane.point);
    const distance = dot_product(diagonal, plane.normal);
    return {
      distance,
      mesh: plane,
      normal: plane.normal
    };
  }

  function project_point_on_merged_mesh(
    point: Vec3,
    merged_mesh: MergedMesh
  ): Projection {
    const projections = merged_mesh.meshes.map(mesh =>
      project_point(point, mesh)
    );
    const distances = projections.map(p => p.distance);
    const real_distance = Math.min(...distances);
    const distance =
      real_distance -
      Math.max(0, merged_mesh.smoothing - Math.max(...distances)) ** 2;
    const normal = normalize(add(projections[0].normal, projections[1].normal));
    return {
      distance,
      mesh: merged_mesh,
      normal
    };
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

  function pixel2ray(pixel: Vec2, screen: Screen, camera: Camera): Ray {
    const uv: Vec2 = [pixel[0] / screen.size[0], pixel[1] / screen.size[1]];
    const aspect_ratio = screen.size[0] / screen.size[1];
    const forward = normalize(subtract(camera.look_at, camera.position));
    const up = camera.up;
    const right = cross_product(forward, up);
    const direction = normalize(
      add(
        forward,
        add(scale((uv[0] - 0.5) * aspect_ratio, right), scale(0.5 - uv[1], up))
      )
    );
    return {
      origin: camera.position,
      direction,
      head: camera.position
    };
  }

  function cross_product([a, b, c]: Vec3, [d, e, f]: Vec3): Vec3 {
    return [b * f - c * e, c * d - a * f, a * e - b * d];
  }
}
