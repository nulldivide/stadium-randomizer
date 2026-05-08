let all_items = {}
let heroes = {}
let global_items = {}
let hero_map = {}
let current_hero = null

async function init() {
    all_items = await(await fetch("./items.json")).json()
    heroes = await(await fetch("./heroes.json")).json()
    const split = split_items(all_items)
    global_items = split.global
    hero_map = split.hero_item_map

    populate_hero_grid()
    random_button_handler()
    document.getElementById("copy-btn").addEventListener("click", copy_build)
}

function split_items(items) {
    const global = {}
    const hero_item_map = {}
    for (const item of Object.values(items)) {
        if (!item.hero) {
            global[item.id] = item
            continue
        }
        if (!hero_item_map[item.hero]) {
            hero_item_map[item.hero] = {}
        }
        hero_item_map[item.hero][item.id] = item
    }
    return {global, hero_item_map}
}

function create_unique_hero_items(hero, global_items, hero_map) {
    const item_pool = {...global_items, ...hero_map[hero]}
    return item_pool
}

function random_hero(heroes) {
    const hero_list = Object.values(heroes).slice()
    const index = Math.floor(Math.random() * hero_list.length)
    return hero_list.splice(index, 1)[0]
}

function random_powers(powers) {
    const chosen_powers = []
    while (chosen_powers.length < 4 && powers.length > 0) {
        const index = Math.floor(Math.random() * powers.length)
        chosen_powers.push(powers.splice(index, 1)[0])
    }
    return chosen_powers
}

function random_items(items) {
    const item_pool = Object.values(items).slice()
    const chosen_items = []
    let gadget_count = 0

    while (chosen_items.length < 6 && item_pool.length > 0) {
        const index = Math.floor(Math.random() * item_pool.length)
        const item = item_pool[index]

        if (item.category === "Gadget" && gadget_count >= 1) {
            item_pool.splice(index, 1)
            continue
        }

        item_pool.splice(index, 1)
        chosen_items.push(item)

        if (item.category === "Gadget") {
            gadget_count++
        }
    }

    return chosen_items
}

function random_button_handler() {
    const random_button = document.getElementById("random-btn")
    random_button.addEventListener("click", () => {
        const hero = random_hero(heroes)
        document.querySelectorAll(".hero-button").forEach(btn => {
            btn.classList.remove("selected")
        })

        const selected = document.getElementById(`hero-${hero.id}`)
        if (selected) {
            selected.classList.add("selected")
        }

        current_hero = hero.id
        create_build(current_hero)
        document.getElementById("powers").hidden = false
        document.getElementById("items").hidden = false
    })
}

function category_class(category) {
    if (!category) return "default"
    return category.toLowerCase()
}

function render_list(id, items) {
    const list = document.getElementById(id)
    list.innerHTML = ""
    items.forEach((item, i) => {
        const li = document.createElement("li")
        li.className = "power-list-element"
        li.dataset.num = `${i + 1}`
        li.textContent = item.name || item
        list.appendChild(li)
    })
}

function render_items(id, items) {
    const container = document.getElementById(id)
    container.innerHTML = ""
    let build_cost = 0

    for (const item of items) {
        build_cost += item.cost

        const div = document.createElement("div")
        div.className = "item-list-element"

        const name = document.createElement("span")
        name.className = "item-name"
        name.textContent = item.name

        const meta = document.createElement("div")
        meta.className = "item-meta"

        const badge = document.createElement("span")
        badge.className = `category-badge ${category_class(item.category)}`
        badge.textContent = item.category || "Item"

        const cost = document.createElement("span")
        cost.className = "item-cost"
        cost.textContent = item.cost

        meta.appendChild(badge)
        meta.appendChild(cost)
        div.appendChild(name)
        div.appendChild(meta)
        container.appendChild(div)
    }

    const cost_div = document.createElement("div")
    cost_div.className = "cost-div"

    const label = document.createElement("span")
    label.textContent = "Total Build Cost"

    const total = document.createElement("span")
    total.className = "cost-total"
    total.textContent = `${build_cost} Stadium Credits`

    cost_div.appendChild(label)
    cost_div.appendChild(total)
    container.appendChild(cost_div)
}

function copy_build() {
    const hero_name = document.getElementById("hero-name").textContent
    const powers = [...document.querySelectorAll(".power-list-element")].map(element => element.textContent)
    const items = [...document.querySelectorAll(".item-list-element .item-name")].map(element => element.textContent)
    const text = `${hero_name}\n\nPowers:\n${powers.map(p => `- ${p}`).join("\n")}\n\nItems:\n${items.map(i => `- ${i}`).join("\n")}`
    navigator.clipboard.writeText(text)

    const copy_btn = document.getElementById("copy-btn")
    copy_btn.textContent = "Copied!"
    setTimeout(() => {
        copy_btn.textContent = "Copy Build"
    }, 1500)
}

function create_build(hero) {
    const hero_data = heroes[hero]
    const item_pool = create_unique_hero_items(hero, global_items, hero_map)
    const powers = random_powers([...hero_data.powers])
    const items = random_items(item_pool)

    const build_section = document.getElementById("build-section")
    const empty = build_section.querySelector(".build-empty-panel")
    if (empty) empty.remove()

    const hero_name = document.getElementById("hero-name")
    hero_name.textContent = hero_data.name
    hero_name.hidden = false

    const powers_section = document.getElementById("powers")
    if (powers_section) {
        powers_section.hidden = false
    }

    const items_section = document.getElementById("items")
    if (items_section) {
        items_section.hidden = false
    }

    const copy_btn = document.getElementById("copy-btn")
    if (copy_btn) {
        copy_btn.hidden = false
    }

    render_list("powers-list", powers)
    render_items("items-list", items)
}

function populate_hero_grid() {
    const grid = document.getElementById("hero-grid")
    grid.innerHTML = ""

    const roles = ["tank", "dps", "support"]

    for (const role of roles) {
        const section = document.createElement("div")
        section.className = `hero-section role-${role}`

        const header = document.createElement("div")
        header.className = "hero-section-header"

        const label = document.createElement("span")
        label.className = "role-label"
        label.textContent = role

        const bar = document.createElement("div")
        bar.className = "role-bar"

        header.appendChild(label)
        header.appendChild(bar)
        const role_grid = document.createElement("div")
        role_grid.className = "hero-role-grid"

        for (const hero of Object.values(heroes)) {
            if (hero.role !== role) continue

            const button = document.createElement("button")
            button.id = `hero-${hero.id}`
            button.className = "hero-button"
            button.type = "button"
            button.title = hero.name

            const img = document.createElement("img")
            img.src = `./assets/heroes/${hero.id}.png`
            img.alt = hero.name
            img.className = "hero-image"

            button.appendChild(img)

            button.addEventListener("click", () => {
                document.querySelectorAll(".hero-button").forEach(btn => {
                    btn.classList.remove("selected")
                })

                button.classList.add("selected")
                current_hero = hero.id
                create_build(hero.id)

                document.getElementById("powers").hidden = false
                document.getElementById("items").hidden = false
            })

            role_grid.appendChild(button)
        }

        section.appendChild(header)
        section.appendChild(role_grid)
        grid.appendChild(section)
    }
}

init()
