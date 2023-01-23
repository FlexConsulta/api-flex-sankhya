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

#Sanetização de banco

- Verificar duplicates
  select count(_), sm.idmotorista , sm.idcliente from status_motoristas sm group by sm.idmotorista, sm.idcliente having count(sm._) > 1;

- Criar indice
  CREATE UNIQUE INDEX status_motoristas_idmotorista_idx ON public.status_motoristas USING btree (idmotorista, idcliente);

#??

- Perguntar se dt_atualizacao e dt_criacao vai pegar do cliente
