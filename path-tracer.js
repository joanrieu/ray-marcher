async function render() {
    for (let y = -2; y <= 2; y += 0.1) {
        for (let x = -3; x <= 3; x += 0.1) {
            const point = [x, y, 0]
            const origin = [0, 0, 5]
            const direction = normalize(subtract(point, origin))
            renderRay({ point, direction })
        }
    }
}

async function renderRay({ point, direction }) {
    let steps = 0
    let object
    let distance = 0
    let isClose = false
    do {
        ++steps
        const find = await findClosestObject({ point })
        point = add(point, scale(find.distance, direction))
        object = find.object
        distance += find.distance
        isClose = find.distance < .01
    } while (!isClose && steps < 100 && distance < 100)
    if (isClose) {
        console.log(object)
    }
}

async function findClosestObject({ point }) {
    const spheres = [
        {
            center: [0, 0, -5],
            radius: .5
        },
        {
            center: [2, 1, -3],
            radius: .5
        },
        {
            center: [-2, 0, -2],
            radius: .5
        }
    ]
    return spheres.map(sphere => ({
        object: sphere,
        distance: norm(subtract(sphere.center, point)) - sphere.radius
    })).reduce((best, current) => current.distance < best.distance ? current : best)
}

render()

// system

function idle() {
    return new Promise(resolve => setTimeout(resolve))
}

// math

function add([a, b, c], [d, e, f]) {
    return [a+d, b+e, c+f]
}

function subtract([a, b, c], [d, e, f]) {
    return [a-d, b-e, c-f]
}

function scale(s, [x, y, z]) {
    return [s*x, s*y, s*z]
}

function norm([x, y, z]) {
    return Math.sqrt(x*x + y*y + z*z)
}

function normalize(v) {
    return scale(1/norm(v), v)
}
