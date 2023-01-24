# 🚀 Welcome to your new awesome project!

This project has been created using **webpack-cli**, you can now run

```
npm run build
```

or

```
yarn build
```

to bundle your application

# Sanetização de banco

- Verificar duplicates
  <br>
  select count(_), sm.idmotorista, sm.idcliente from status_motoristas sm group by sm.idmotorista, sm.idcliente having count(sm._) > 1;
  <br>
  select count(_), sp.idproprietario, sp.idcliente from status_proprietarios sp group by sp.idproprietario, sp.idcliente having count(sp._) > 1;

- Criar indice
  <br>
  CREATE UNIQUE INDEX status_motoristas_idmotorista_idx ON public.status_motoristas USING btree (idmotorista, idcliente);
  <br>
  CREATE UNIQUE INDEX status_proprietarios_idproprietario_idx ON public.status_proprietarios USING btree (idproprietario,idcliente);

# ??

- Perguntar se dt_atualizacao e dt_criacao vai pegar do cliente
