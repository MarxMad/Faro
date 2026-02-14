import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Ajustes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configura tu perfil y preferencias de la plataforma
        </p>
      </div>

      <div className="glass-panel mx-auto w-full max-w-2xl p-8">
        <h2 className="font-display text-lg font-semibold">Perfil de empresa</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Informacion basica de tu organizacion
        </p>

        <Separator className="my-6 bg-border" />

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Nombre de la empresa</Label>
            <Input defaultValue="Mi Empresa S.A. de C.V." className="border-border" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground">RFC</Label>
              <Input defaultValue="MEM210101ABC" className="border-border" />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground">Sector</Label>
              <Input defaultValue="Tecnologia" className="border-border" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Email de contacto</Label>
            <Input type="email" defaultValue="admin@miempresa.com" className="border-border" />
          </div>
        </div>

        <Separator className="my-6 bg-border" />

        <h2 className="font-display text-lg font-semibold">Wallet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tu direccion en la red Stellar
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Label className="text-muted-foreground">Direccion publica</Label>
          <Input
            readOnly
            value="GBXYZ...NO_CONECTADA"
            className="border-border bg-secondary/50 font-mono text-sm"
          />
        </div>

        <div className="mt-8 flex justify-end">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  )
}
