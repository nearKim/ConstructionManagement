export default function fetch(input, init = {}) {
    return window.fetch(input, Object.assign({
        credentials: 'same-origin'
    }, init))
}