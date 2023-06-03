import {
  Button,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuDivider,
  Text,
  Skeleton,
  Center,
} from "@chakra-ui/react";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { BiChevronDown } from "react-icons/bi";
import {
  MdAdd,
  MdCheck,
  MdSettings,
  MdCampaign,
  MdPhotoFilter,
  MdHome,
  MdOutlineDataset,
} from "react-icons/md";
import Link from "next/link";

export default function DashboardSidebar() {
  const router = useRouter();

  const { data: restaurants } = api.restaurant.getByOrganizationId.useQuery(
    {
      organizationId: router.query.organizationId as string,
    },
    {
      enabled: !!router.query.organizationId,
    }
  );

  const { data: currentRestaurant } = api.restaurant.getById.useQuery(
    {
      id: router.query.restaurantId as string,
    },
    {
      enabled: !!router.query.restaurantId,
    }
  );

  const links = [
    {
      name: "Accueil",
      slug: "",
      icon: MdHome,
    },
    {
      name: "Stories",
      slug: "stories",
      icon: MdPhotoFilter,
    },
    {
      name: "Campagnes",
      slug: "campaigns",
      icon: MdCampaign,
    },
  ];

  const settings = [
    {
      name: "Ressources",
      slug: "resources",
      icon: MdOutlineDataset,
    },
    {
      name: "Paramètres",
      slug: "settings",
      icon: MdSettings,
    },
  ];

  return (
    <Flex
      direction="column"
      alignItems="center"
      h="full"
      minW={200}
      borderRight="1px"
      pt={6}
    >
      <Menu>
        <MenuButton as={Button} variant="unstyled">
          <Skeleton isLoaded={!!currentRestaurant}>
            <Center minW={28}>
              {currentRestaurant?.name}
              <Icon as={BiChevronDown} mt={0.5} ml={0.5} />
            </Center>
          </Skeleton>
        </MenuButton>
        <MenuList>
          {restaurants?.map((restaurant) => (
            <Link
              href={`/dashboard/${
                router.query.organizationId as string
              }/restaurant/${restaurant.id}`}
              key={restaurant.id}
            >
              <MenuItem>
                <Text>{restaurant.name}</Text>
                {currentRestaurant?.id === restaurant.id && (
                  <Icon as={MdCheck} ml="auto" />
                )}
              </MenuItem>
            </Link>
          ))}
          <MenuDivider />
          <MenuItem>
            <Text mr={4}>Créer un nouveau restaurant</Text>
            <Icon as={MdAdd} ml="auto" />
          </MenuItem>
        </MenuList>
      </Menu>
      <Flex direction="column" alignItems="start" gap={4} mt={12}>
        {links.map(({ slug, name, icon }) => (
          <Link
            href={`/dashboard/${
              router.query.organizationId as string
            }/restaurant/${router.query.restaurantId as string}/${slug}`}
            style={{ width: "100%" }}
            key={slug}
          >
            <Button
              w="full"
              justifyContent="start"
              variant="ghost"
              leftIcon={<Icon as={icon} w={5} h={5} />}
            >
              {name}
            </Button>
          </Link>
        ))}
      </Flex>
      <Flex direction="column" alignItems="start" gap={4} mt={12}>
        {settings.map(({ slug, name, icon }) => (
          <Link
            href={`/dashboard/${
              router.query.organizationId as string
            }/restaurant/${router.query.restaurantId as string}/${slug}`}
            style={{ width: "100%" }}
            key={slug}
          >
            <Button
              w="full"
              justifyContent="start"
              variant="ghost"
              leftIcon={<Icon as={icon} w={5} h={5} />}
            >
              {name}
            </Button>
          </Link>
        ))}
      </Flex>
    </Flex>
  );
}
