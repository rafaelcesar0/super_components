# Super Components - Smart Table

Uma biblioteca de componentes inteligentes para simplificar operações CRUD, desenvolvida especialmente para agilizar o trabalho de desenvolvedores "cruderos".

## 🎯 Objetivo

O **Super Components** foi criado para eliminar a complexidade repetitiva no desenvolvimento de interfaces CRUD. Com apenas algumas linhas de código, você pode transformar qualquer payload de API em uma tabela interativa, completa e profissional.

## ✨ Principais Funcionalidades

### 🔍 Introspecção Automática de Dados
- **Detecção inteligente** de arrays de objetos em payloads complexos
- **Geração automática** de colunas baseada na estrutura dos dados
- **Priorização** automática de colunas ID (sempre aparecem primeiro)
- **Inferência de tipos** para formatação adequada (números, datas, booleanos)

### 🎨 Interface Rica e Responsiva
- **Rolagem horizontal** automática para tabelas largas
- **Paginação** completa com controles duplicados (topo e rodapé)
- **Design consistente** usando shadcn/ui + Tailwind CSS v4
- **Tooltips** informativos em todos os elementos interativos

### 🔎 Sistema de Busca Avançado
- **Busca global** em tempo real
- **Filtros por coluna** específica
- **Case sensitive** opcional
- **Busca exata** (exact match)
- **Aplicação imediata** de filtros conforme alterações

### 🛠️ Menu de Contexto (Preparado para CRUD)
- **Botão direito** em qualquer linha
- **Ações personalizáveis**: Editar, Deletar, Criar
- **Extensível** para suas necessidades específicas

## 🚀 Como Usar

### Instalação Básica

```bash
bun install
bun dev
```

### Exemplo Simples

```tsx
import { ApiSmartTable } from "@/components/api-smart-table";

function MinhaTabela() {
  const [dados, setDados] = useState(null);

  // Busque seus dados de qualquer API
  useEffect(() => {
    fetch('https://sua-api.com/usuarios')
      .then(res => res.json())
      .then(setDados);
  }, []);

  return (
    <ApiSmartTable
      tableId="usuarios-tabela"
      payload={dados}
      options={{
        maxDepth: 2,
        arrayStrategy: "join",
        maxColumns: 15
      }}
      rowContextMenu={{
        enabled: true,
        onEdit: (row) => editarUsuario(row),
        onDelete: (row) => deletarUsuario(row),
        onCreate: () => criarNovoUsuario()
      }}
    />
  );
}
```

### Opções de Configuração

```tsx
type IntrospectOptions = {
  maxDepth?: number;           // Profundidade máxima para objetos aninhados
  arrayStrategy?: "join" | "count" | "first"; // Como tratar arrays
  maxColumns?: number;         // Limite de colunas exibidas
  onlyPaths?: string[];       // Mostrar apenas colunas específicas
  omitPaths?: string[];       // Ocultar colunas específicas
  headerOverrides?: Record<string, string>; // Personalizar cabeçalhos
}
```

## 🏗️ Stack Tecnológica

- **Runtime**: Bun
- **Framework**: Next.js 15 (App Router)
- **Bundler**: Turbopack
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui (New York style)
- **Table**: @tanstack/react-table
- **TypeScript**: Configuração strict

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── api-smart-table.tsx    # Componente principal
│   ├── data-table-core.tsx    # Lógica da tabela
│   └── ui/                    # Componentes shadcn/ui
├── lib/
│   └── data-introspect.ts     # Lógica de introspecção
├── hooks/
│   └── use-table-state.ts     # Estado da tabela
└── app/
    └── demo/                  # Exemplos de uso
```

## 🎮 Demo

Execute o projeto e acesse `/demo/jsonplaceholder` para ver a tabela em ação com dados reais da API JSONPlaceholder.

## 🤝 Para Desenvolvedores "Cruderos"

Se você é como nós e passa boa parte do tempo criando interfaces para:
- ✅ Listar dados
- ✅ Buscar e filtrar
- ✅ Paginar resultados
- ✅ Editar registros
- ✅ Deletar itens

Este projeto vai economizar **horas** do seu desenvolvimento. Apenas passe os dados da sua API e tenha uma interface completa instantaneamente.

## 🔮 Próximas Features

- [ ] Edição inline de células
- [ ] Exportação para CSV/Excel
- [ ] Temas personalizáveis
- [ ] Validação de dados
- [ ] Suporte a filtros avançados (data ranges, etc)
- [ ] Integração com formulários de criação/edição

## 📄 Licença

MIT License - Use como quiser, desenvolva e seja feliz! 🚀

---

**Desenvolvido com ❤️ para simplificar a vida dos desenvolvedores CRUD**
