import { RefObject, useEffect, useEffectEvent } from "react"

type UseClickOutsideOptions = {
    enabled?: boolean
}

const useClickOutside = <T extends HTMLElement>(
    ref: RefObject<T | null>,
    onClickOutside: () => void,
    { enabled = true }: UseClickOutsideOptions = {}
) => {
    const handleClickOutside = useEffectEvent((event: MouseEvent | TouchEvent) => {
        const target = event.target

        if (!(target instanceof Node)) {
            return
        }

        if (!ref.current || ref.current.contains(target)) {
            return
        }

        onClickOutside()
    })

    useEffect(() => {
        if (!enabled) {
            return
        }

        const listener = (event: MouseEvent | TouchEvent) => {
            handleClickOutside(event)
        }

        document.addEventListener("mousedown", listener)
        document.addEventListener("touchstart", listener)

        return () => {
            document.removeEventListener("mousedown", listener)
            document.removeEventListener("touchstart", listener)
        }
    }, [enabled, ref])
}

export default useClickOutside
