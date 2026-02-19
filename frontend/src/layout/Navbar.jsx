import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/',              label: 'Home',          end: true },
  { to: '/analyze',       label: 'Analyze' },
  { to: '/results',       label: 'Results' },
  { to: '/documentation', label: 'Documentation' },
  { to: '/about',         label: 'About' },
]

export default function Navbar() {
  return (
    <nav
      className="bg-gov-blue sticky top-0 z-40 border-b border-[#002244]"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-5xl mx-auto px-6">
        <ul className="flex items-stretch gap-0 list-none m-0 p-0" role="list">
          {navItems.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3.5 text-sm font-semibold border-b-3 transition-colors tracking-wide ${
                    isActive
                      ? 'text-white border-b-4 border-b-[#ffcc00] border-b-solid bg-[#002d5c]'
                      : 'text-blue-200 border-b-4 border-b-transparent hover:text-white hover:bg-[#002d5c]'
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
