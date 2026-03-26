import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  errorKey: number
}

export default class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, errorKey: 0 }
  private retryTimeout: ReturnType<typeof setTimeout> | null = null

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    // Suppress rapier WASM cleanup errors — they're non-fatal
    if (
      error.message?.includes('recursive use of an object') ||
      error.message?.includes('unreachable') ||
      error.message?.includes('unsafe aliasing')
    ) {
      // Auto-recover after Rapier crash: re-mount the scene after a delay
      if (this.retryTimeout) clearTimeout(this.retryTimeout)
      this.retryTimeout = setTimeout(() => {
        this.setState(prev => ({
          hasError: false,
          errorKey: prev.errorKey + 1
        }))
      }, 1500)
      return
    }
    console.error('3D Scene error:', error)
  }

  componentWillUnmount() {
    if (this.retryTimeout) clearTimeout(this.retryTimeout)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null
    }
    return (
      <div key={this.state.errorKey} style={{ width: '100%', height: '100%' }}>
        {this.props.children}
      </div>
    )
  }
}
